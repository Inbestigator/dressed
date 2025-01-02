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
): APIApplicationCommandOption {
  const input = {
    ...data,
    type: ApplicationCommandOptionType[data.type],
  };

  return input as unknown as APIApplicationCommandOption;
}
