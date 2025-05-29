import type {
  BaseData,
  CommandConfig,
  CommandData,
} from "../../types/config.ts";
import ora from "ora";
import { stdout } from "node:process";
import { installGlobalCommands } from "../utils.ts";
import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
} from "discord-api-types/v10";
import { createHandlerSetup } from "./index.ts";
import type { CommandInteraction } from "dressed";
import { botEnv } from "../../utils/env.ts";

/**
 * Installs commands to the Discord API
 */
export async function installCommands(commands: BaseData<CommandData>[]) {
  const registerLoader = ora({
    stream: stdout,
    text: "Registering commands",
  }).start();

  await installGlobalCommands(
    botEnv.DISCORD_APP_ID,
    await Promise.all(
      commands.map(async (c) => {
        const config = c.data.config ?? ({} as CommandConfig);
        if (!config.type) {
          config.type = "ChatInput";
        }
        return {
          ...config,
          name: c.name,
          type: ApplicationCommandType[config.type],
          integration_types: config.integration_type
            ? [ApplicationIntegrationType[`${config.integration_type}Install`]]
            : [0, 1],
          contexts: config.contexts
            ? config.contexts.reduce<number[]>(
                (p, c) =>
                  !p.includes(InteractionContextType[c])
                    ? [...p, InteractionContextType[c]]
                    : p,
                [],
              )
            : [0, 1, 2],
          ...(config.type === "ChatInput"
            ? {
                description: config.description ?? "No description provided",
              }
            : {}),
        };
      }),
    ),
  );

  registerLoader.succeed("Registered commands");
}

/**
 * Creates the command handler
 * @returns A function that runs a command
 */
export const setupCommands = createHandlerSetup<
  CommandData,
  CommandInteraction
>({
  itemMessages: (interaction) => ({
    noItem: `No command handler for "${interaction.data.name}"`,
    pending: (item) => `Running command "${item.name}"`,
  }),
  findItem(interaction, items) {
    const item = items.find((i) => i.name === interaction.data.name);
    if (!item) {
      return;
    }
    return [item, [interaction]];
  },
});
