import { type APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

type CommandOptionMap = {
  [Key in keyof typeof ApplicationCommandOptionType]: Extract<
    APIApplicationCommandOption,
    { type: (typeof ApplicationCommandOptionType)[Key] }
  >;
};

type SubcommandKey = "Subcommand" | "SubcommandGroup";
type FocusableKey = "String" | "Integer" | "Number";

/**
 * A parameter available for users to fill in chat input commands
 * @see https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure
 */
export function CommandOption<
  K extends keyof typeof ApplicationCommandOptionType,
  N extends string,
  R extends boolean,
  O extends K extends SubcommandKey ? CommandOptionMap[K]["options"] : never,
  A extends K extends FocusableKey ? boolean : never = K extends FocusableKey ? false : never,
>(
  config: Omit<CommandOptionMap[K], "type"> & { type: K; name: N; required?: R } & (K extends SubcommandKey
      ? { options?: O }
      : K extends FocusableKey
        ? { autocomplete?: A }
        : object),
): CommandOptionMap[K] & { name: N; required: R; options: O; autocomplete: A } {
  return { ...config, type: ApplicationCommandOptionType[config.type] } as unknown as ReturnType<
    typeof CommandOption<K, N, R, O, A>
  >;
}
