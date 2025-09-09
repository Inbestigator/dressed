# Commands

The command names are determined by their file name, here's a typical command
structure:

```sh
src
└ commands
  ├ greet.ts # Will become /greet
  └ trivia.ts # Will become /trivia
```

This means that command file names must be globally unique.

## Command execution

All commands are required to have a default export, this function is how your
command will be handled.

```ts title="src / commands / greet.ts" showLineNumbers
import type { CommandInteraction } from "dressed";

export default async function (interaction: CommandInteraction) {
  await interaction.reply("Hi there!");
}
```

## Autocomplete

For some command options, you want to enable autocomplete. To create a handler for those interactions, you can simply export a function named autocomplete!

```ts showLineNumbers
import {
  CommandOption,
  type CommandConfig,
  type CommandAutocompleteInteraction,
} from "dressed";

export const config: CommandConfig = {
  description: "Send a random adorable animal photo",
  options: [
    CommandOption({
      type: "String",
      name: "animal",
      description: "The type of animal",
      required: true,
      autocomplete: true,
    }),
  ],
};

export function autocomplete(interaction: CommandAutocompleteInteraction) {
  // sendChoices returns the options for them to select from
  interaction.sendChoices([
    { name: "Dog", value: "dog" },
    { name: "Cat", value: "cat" },
  ]);
}
```
