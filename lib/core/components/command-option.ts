import {
  type APIApplicationCommandOption,
  ApplicationCommandOptionType,
} from "discord-api-types/v10";

type CommandOptionMap = {
  [Key in keyof typeof ApplicationCommandOptionType]: Extract<
    APIApplicationCommandOption,
    { type: typeof ApplicationCommandOptionType[Key] }
  >;
};

/**
 * Creates an application command option
 */
export function CommandOption<
  K extends keyof typeof ApplicationCommandOptionType,
>(
  data: Omit<CommandOptionMap[K], "type"> & {
    type: K;
  },
): CommandOptionMap[K] {
  return {
    ...data,
    type: ApplicationCommandOptionType[data.type],
  } as CommandOptionMap[K];
}
