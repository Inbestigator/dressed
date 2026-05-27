import {
  type APIInteraction,
  type APIWebhookEvent,
  ApplicationWebhookType,
  InteractionType,
} from "discord-api-types/v10";
import type { CommandData, ComponentData, DressedConfig, EventData, ServerConfig } from "../types/config.ts";
import type { CommandRunner, ComponentRunner, EventRunner } from "../types/handlers.ts";
import { config as dressedConfig } from "../utils/env.ts";
import logger from "../utils/log.ts";
import { createInteraction } from "./extenders/interaction.ts";
import { setupCommands } from "./handlers/commands.ts";
import { setupComponents } from "./handlers/components.ts";
import { setupEvents } from "./handlers/events.ts";
import { verifySignature } from "./signature.ts";

/**
 * Handles a request from Discord.
 * @param req The incoming request
 * @param commands A list of commands or the function to run a command
 * @param components A list of components or the function to run a component
 * @param events A list of events or the function to run an event
 * @returns The response to send back
 */
export async function handleRequest(
  req: Request,
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  events: EventRunner | EventData[],
  hooks: Parameters<typeof handleInteraction>[3] & Parameters<typeof handleEvent>[2] = dressedConfig.hooks ?? {},
): Promise<Response> {
  const body = await req.text();
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");

  if (!signature || !timestamp) {
    logger.error(new Error("Missing signature headers"));
    return new Response(null, { status: 401 });
  }

  const verified = await verifySignature(body, signature, timestamp);

  if (!verified) {
    logger.error(new Error("Invalid signature"));
    return new Response(null, { status: 401 });
  }

  try {
    const json = JSON.parse(body);

    // Ensure payload evaluates to a structured non-null object
    if (typeof json !== "object" || json === null) {
      logger.error(new Error("Request body is not a JSON object"));
      return new Response(null, { status: 400 });
    }

    let status: number;
    // The interaction response token is now guaranteed safe to query with 'in'
    if ("token" in json) {
      status = await handleInteraction(commands, components, json, hooks);
    } else {
      status = await handleEvent(events, json, hooks);
    }
    return new Response(status === 200 ? '{"type":1}' : null, { status });
  } catch (error) {
    const isSyntaxError = error instanceof SyntaxError;
    logger.error(
      new Error(isSyntaxError ? "Invalid JSON body" : "Failed to process request", {
        cause: error,
      }),
    );
    return new Response(null, { status: isSyntaxError ? 400 : 500 });
  }
}

/**
 * Runs an interaction, takes functions to run commands/components and the interaction body.
 */
export async function handleInteraction(
  commands: CommandRunner | CommandData[],
  components: ComponentRunner | ComponentData[],
  interaction: APIInteraction,
  hooks: Pick<
    NonNullable<ServerConfig["hooks"]>,
    "onBeforeCommand" | "onBeforeComponent" | "onUnknownInteraction"
  > = dressedConfig.hooks ?? {},
): Promise<200 | 202 | 404> {
  const unknown = hooks.onUnknownInteraction;
  switch (interaction.type) {
    case InteractionType.Ping: {
      logger.succeed("Received ping test");
      return 200;
    }
    case InteractionType.ApplicationCommand: {
      const runCommand = typeof commands === "function" ? commands : setupCommands(commands);
      await runCommand(createInteraction(interaction), { before: hooks.onBeforeCommand as never, unknown });
      return 202;
    }
    case InteractionType.ApplicationCommandAutocomplete: {
      const runCommand = typeof commands === "function" ? commands : setupCommands(commands);
      await runCommand(createInteraction(interaction), { unknown }, "autocomplete");
      return 202;
    }
    case InteractionType.MessageComponent:
    case InteractionType.ModalSubmit: {
      const runComponent = typeof components === "function" ? components : setupComponents(components);
      await runComponent(createInteraction(interaction), { before: hooks.onBeforeComponent, unknown });
      return 202;
    }
    default: {
      logger.error(new Error("Received invalid interaction", { cause: interaction }));
      return 404;
    }
  }
}

/**
 * Runs an event, takes a function to run events and the event body.
 */
export async function handleEvent(
  events: EventRunner | EventData[],
  event: APIWebhookEvent,
  hooks: Pick<NonNullable<DressedConfig["hooks"]>, "onBeforeEvent" | "onUnknownEvent"> = dressedConfig.hooks ?? {},
): Promise<200 | 202 | 404> {
  switch (event.type) {
    case ApplicationWebhookType.Ping: {
      logger.succeed("Received ping test");
      return 200;
    }
    case ApplicationWebhookType.Event: {
      const runEvent = typeof events === "function" ? events : setupEvents(events);
      await runEvent(event.event, { before: hooks.onBeforeEvent, unknown: hooks.onUnknownEvent });
      return 202;
    }
    default: {
      logger.error(new Error("Received invalid event", { cause: event }));
      return 404;
    }
  }
}
