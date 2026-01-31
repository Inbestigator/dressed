# Command Config

Each command can optionally export a `config` object.

```ts
import { type CommandConfig, CommandOption } from "dressed";

export const config = {
  description: "Send a random adorable animal photo",
  options: [
    CommandOption({
      name: "animal",
      description: "The type of animal",
      type: "String",
      required: true,
    }),
  ],
} satisfies CommandConfig;
```

## Config type

The config object supports all of the [Discord application command option type](https://discord.com/developers/docs/interactions/application-commands#application-command-object).

## Unlocking handler functionality

Passing your config into the type for your command interaction will unlock option autocomplete.

```ts
import { type CommandConfig, type CommandInteraction, CommandOption } from "dressed";

// You must use the `satisfies` keyword, as it doesn't override the contents of your config.
// ❌ `config: CommandConfig = { ... }`
// ❌ `config = { ... } as CommandConfig`
export const config = { ... } satisfies CommandConfig;

export default function myCommand(interaction: CommandInteraction<typeof config>) {
  // Passing in config means that the names/types of options are automatically determined
  console.log(interaction.options.animal);
  //                              ^? (property) animal: string
}
```
