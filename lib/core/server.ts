import ora from "ora";
import { verifySignature } from "../internal/utils.ts";
import {
  type APIApplicationCommandInteraction,
  type APIMessageComponentInteraction,
  type APIModalSubmitInteraction,
  InteractionType,
} from "discord-api-types/v10";
import createInteraction from "../internal/interaction.ts";
import type {
  BotConfig,
  CommandHandler,
  ComponentHandler,
} from "../internal/types/config.ts";
import express from "express";

interface ExpressReq {
  headers: Record<string, string>;
  body: unknown;
}

interface ExpressRes {
  send: (
    x: unknown,
  ) => {
    status: ExpressRes["status"];
  };
  json: (x: unknown) => void;
  status: (
    arg0: number,
  ) => {
    send: ExpressRes["send"];
  };
}

/**
 * Start serving an Express server
 */
export function createServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  config: BotConfig,
) {
  const app = express();
  app.use(express.json());

  app.post(
    config.endpoint ?? "/",
    // @ts-ignore This works fine
    async (
      req: ExpressReq,
      res: ExpressRes,
    ) => {
      const reqLoader = ora("New request").start();
      const maskedReq = {
        headers: {
          get: (name: string) => {
            return req.headers[name.toLowerCase()];
          },
        },
        text: () => JSON.stringify(req.body),
        json: () => req.body,
      };

      if (!(await verifySignature(maskedReq as unknown as Request))) {
        reqLoader.fail();
        console.error(" └ Invalid signature");
        res.send(null).status(401);
        return;
      }

      reqLoader.stopAndPersist({
        symbol: "┌",
      });

      try {
        const response = await runInteraction(
          runCommand,
          runComponent,
          maskedReq as unknown as Request,
        );

        const { status } = response;
        if (status === 200) {
          res.json({ type: 1 });
        }
        res.status(status);
      } catch (error) {
        console.error(" └ Error processing request:", error);
        res.status(500).send("Internal Server Error");
      }
    },
  );

  app.listen(8000, () => {
    console.log("Bot listening on port 8000");
  });
}

/**
 * Runs an interaction, takes a function to run commands/components and the entry request
 */
export async function runInteraction(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  req: Request,
): Promise<Response> {
  const json = await req.json();
  switch (json.type) {
    case InteractionType.Ping: {
      console.log("└ Received ping test");
      return new Response(JSON.stringify({ type: 1 }), { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      const command = json as APIApplicationCommandInteraction;
      console.log("└ Received command:", command.data.name);
      const interaction = createInteraction(command);

      await runCommand(interaction);
      return new Response(null, { status: 204 });
    }
    case InteractionType.MessageComponent: {
      const component = json as APIMessageComponentInteraction;
      console.log("└ Received component:", component.data.custom_id);
      const interaction = createInteraction(component);

      await runComponent(interaction);
      return new Response(null, { status: 204 });
    }
    case InteractionType.ModalSubmit: {
      const component = json as APIModalSubmitInteraction;
      console.log("└ Received modal:", component.data.custom_id);
      const interaction = createInteraction(component);

      await runComponent(interaction);
      return new Response(null, { status: 204 });
    }
  }

  return new Response(null, { status: 404 });
}
