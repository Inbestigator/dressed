import type { BuildEvent, Event, EventHandler } from "../types/config.ts";
import { trackParts, type WalkEntry } from "../build.ts";
import ora from "ora";
import { stdout } from "node:process";
import { ApplicationWebhookEventType } from "discord-api-types/v10";

/**
 * Creates the event handler
 * @returns A function that runs an event
 */
export function setupEvents(events: Event[]): EventHandler {
  return async function runEvent(event) {
    const handler = events.find((c) => c.type === event.type);

    if (!handler) {
      ora(`No event handler for "${event.type}"`).warn();
      return;
    }

    const eventLoader = ora({
      stream: stdout,
      text: `Running event "${handler?.name}"`,
    }).start();

    try {
      await Promise.resolve(
        (
          (await handler.import()).default as (
            d: typeof event.data,
          ) => Promise<void>
        )(event.data),
      );
      eventLoader.succeed();
    } catch (error) {
      eventLoader.fail();
      console.error("└", error);
    }
  };
}

export function parseEvents(eventFiles: WalkEntry[]) {
  const generatingLoader = ora({
    stream: stdout,
    text: "Generating events",
  }).start();
  const { addRow, log } = trackParts(eventFiles.length, "Event");
  try {
    const eventData: BuildEvent[] = [];

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

      const event: BuildEvent = {
        name: file.name,
        type,
        path: file.path,
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
