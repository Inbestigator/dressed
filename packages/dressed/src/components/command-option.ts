import { type APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

type CommandOptionMap = {
  [Key in keyof typeof ApplicationCommandOptionType]: Extract<
    APIApplicationCommandOption,
    { type: (typeof ApplicationCommandOptionType)[Key] }
  >;
};

/**
 * Creates an application command option
 */
export function CommandOption<
  K extends keyof typeof ApplicationCommandOptionType,
  N extends string,
  R extends boolean,
  O extends K extends "Subcommand" | "SubcommandGroup" ? CommandOptionMap[K]["options"] : never,
>(
  config: Omit<CommandOptionMap[K], "type"> & { name: N; required?: R; type: K } & (K extends
      | "Subcommand"
      | "SubcommandGroup"
      ? { options?: O }
      : unknown),
): CommandOptionMap[K] & { name: N; required: R; options: O } {
  return { ...config, type: ApplicationCommandOptionType[config.type] } as unknown as ReturnType<
    typeof CommandOption<K, N, R, O>
  >;
}
