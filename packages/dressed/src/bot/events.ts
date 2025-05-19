import type { EventData, EventHandler } from "../types/config.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import ora from "ora";
import { stdout } from "node:process";
import { ApplicationWebhookEventType } from "discord-api-types/v10";
import importUserFile from "../server/import.ts";
import { logRunnerError } from "./utils.ts";

/**
 * Creates the event handler
 * @returns A function that runs an event
 */
export function setupEvents(events: EventData[]): EventHandler {
  return async function runEvent(event) {
    const handler = events.find((e) => e.type === event.type);

    if (!handler) {
      ora(`No event handler for "${event.type}"`).warn();
      return;
    }

    const eventLoader = ora({
      stream: stdout,
      text: `Running event "${handler?.name}"`,
    }).start();

    try {
      await (
        (await importUserFile(handler)) as { default: EventHandler }
      ).default(event);
      eventLoader.succeed();
    } catch (e) {
      logRunnerError(e, eventLoader);
    }
  };
}

export function parseEvents(eventFiles: WalkEntry[]): EventData[] {
  if (eventFiles.length === 0) return [];
  const generatingLoader = ora({
    stream: stdout,
    text: "Generating events",
  }).start();
  const { addRow, log } = trackParts(eventFiles.length, "Event");
  try {
    const eventData: EventData[] = [];

    for (const file of eventFiles) {
      const type =
        ApplicationWebhookEventType[
          file.name as keyof typeof ApplicationWebhookEventType
        ];

      if (!type) {
        ora(
          `Event type of "${file.name}" could not be determined, skipping`,
        ).warn();
        continue;
      }

      const event = {
        name: file.name,
        path: file.path,
        type,
      };

      if (eventData.find((c) => c.name === event.name && c.type === type)) {
        ora(
          `${event.type} event "${event.name}" already exists, skipping the duplicate`,
        ).warn();
        continue;
      }

      eventData.push(event);
      addRow(event.name);
    }

    generatingLoader.succeed(
      eventData.length > 0 ? "Generated events" : "No events found",
    );

    if (eventData.length > 0) {
      log();
    }

    return eventData;
  } catch (e) {
    generatingLoader.fail();
    throw e;
  }
}
