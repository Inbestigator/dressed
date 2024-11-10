import nacl from "tweetnacl";
import { Buffer } from "node:buffer";
import loader from "../internal/loader.ts";
import createInteraction from "./interaction.ts";
import {
  APIApplicationCommandInteraction,
  APIMessageComponentInteraction,
  InteractionType,
} from "discord-api-types/v10";

async function verifySignature(req: Request): Promise<boolean> {
  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return false;
  }

  const body = await req.text();

  return nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(Deno.env.get("DISCORD_PUBLIC_KEY") as string, "hex"),
  );
}

async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const reqLoader = loader(`[${req.method}] ${url.pathname}`);
  const method = req.method;

  if (!(await verifySignature(req.clone()))) {
    reqLoader.error().then(() => console.error(" └ Invalid signature"));
    return new Response("Unauthorized", { status: 401 });
  }

  const routeHandlers = handlers[url.pathname];
  const handler = routeHandlers?.[method];

  if (handler) {
    reqLoader.resolve();
    return handler(req);
  }

  reqLoader.error().then(() => console.error(" └ No handler for this method"));
  return new Response("Not Found", { status: 404 });
}

Deno.serve((req) => router(req));

const handlers: Record<
  string,
  Record<string, (req: Request) => Response | Promise<Response>>
> = {
  "/": {
    POST: async (req) => {
      const json = await req.json();
      switch (json.type) {
        case InteractionType.Ping: {
          return new Response(JSON.stringify({ type: 1 }), { status: 200 });
        }
        case InteractionType.ApplicationCommand: {
          const command = json as APIApplicationCommandInteraction;
          console.log(" ├ Received application command interaction");
          console.log(" └ Command:", command.data.name);
          const interaction = createInteraction(command);

          if (interaction.data.name === "test") {
            await interaction.reply("Hello, world!");
            return new Response(null, { status: 200 });
          }
          break;
        }
        case InteractionType.MessageComponent: {
          const component = json as APIMessageComponentInteraction;
          console.log(" ├ Received message component interaction");
          console.log(" └ Component:", component.data.custom_id);
          break;
        }
        case InteractionType.ApplicationCommandAutocomplete: {
          break;
        }
        case InteractionType.ModalSubmit: {
          break;
        }
      }

      return new Response(null, { status: 500 });
    },
  },
};
