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
import type { CommandConfig, CommandInteraction } from "dressed";

// You must use `satisfies`, as it means that the contents of your config aren't overriden.
// ❌ `config: CommandConfig = { ... }`
// ❌ `config = { ... } as CommandConfig`
export const config = { ... } satisfies CommandConfig;

export default function myCommand(interaction: CommandInteraction<typeof config>) {
  // Passing in config means that the names of options and the type is automatically suggested
  console.log(interaction.getOption("animal", true).string());
}
```
