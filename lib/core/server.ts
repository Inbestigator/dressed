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
import { handle } from "@http/route/handle";
import { byPattern } from "@http/route/by-pattern";
import { byMethod } from "@http/route/by-method";
// @ts-types="@types/express"
import express from "express";

/**
 * Start serving a Deno server
 */
export function startDenoServer(
  runCommand: CommandHandler,
  runComponent: ComponentHandler,
  config: BotConfig,
) {
  Deno.serve(handle([
    byPattern(
      config.endpoint ?? "/",
      byMethod({
        POST: async (req) => {
          const reqLoader = ora("New request").start();
          if (!(await verifySignature(req))) {
            reqLoader.fail();
            console.error("└ Invalid signature");
            return new Response("Unauthorized", { status: 401 });
          }

          reqLoader.stopAndPersist({
            symbol: "┌",
          });
          return await runInteraction(runCommand, runComponent, req);
        },
      }),
    ),
  ]));
}

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
  json: (arg0: { type: number }) => void;
  status: (
    arg0: number,
  ) => {
    send: ExpressRes["send"];
  };
}

/**
 * Start serving a Node server
 */
export function startNodeServer(
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
        console.error(" └ Invalid signature");
        res.send(null).status(401);
        return;
      }

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
    console.log(`Example app listening on port 8000`);
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
