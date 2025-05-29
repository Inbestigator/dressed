import {
  Routes,
  type RESTPostAPIBaseApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import type { Ora } from "ora";
import { callDiscord } from "../utils/call-discord.ts";

export async function installGlobalCommands(
  appId: string,
  commands: RESTPostAPIBaseApplicationCommandsJSONBody[],
) {
  await callDiscord(Routes.applicationCommands(appId), {
    method: "PUT",
    body: commands,
  });
}

export function logRunnerError(error: unknown, loader: Ora) {
  const text = loader.text.replace("Running", "Failed to run");
  if (error instanceof Error) {
    loader.fail(`${text} - ${error.message}`);
  } else {
    loader.fail(text);
    console.error(error);
  }
}
