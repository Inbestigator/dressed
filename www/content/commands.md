# Commands

Defining commands with Dressed is easy. They're accepted the same way in a standard object by all server functions.

```ts
import { type CommandData, createServer, registerCommands } from "dressed/server";

const commands = {
  // This will become /greet
  greet: {
    async default(interaction) {
      await interaction.reply("Hi there!");
    },
  } satisfies CommandData,
};

await registerCommands(commands);

createServer(
  commands,
  {}, // Components
  {}, // Events
);
```

See the [Components](/docs/components) and [Events](/docs/events) documentation for more information.

The framework automatically passes your file exports into the handler object. Essentially, it does this under the hood:

```ts title="src / commands / ping.ts" showLineNumbers
import { type CommandConfig, type CommandInteraction, CommandOption } from "dressed";

export const config = {
  description: "Sends pong",
  options: [
    CommandOption({
      type: "String",
      name: "visibility",
      description: "Whether the response is shown in chat",
      choices: [
        { name: "Public", value: "1" },
        { name: "Private", value: "0" },
      ],
    }),
  ],
} satisfies CommandConfig;

export default async function (interaction: CommandInteraction<typeof config>) {
  await interaction.reply({
    content: "Pong!",
    ephemeral: !Number(interaction.options.visibility),
  });
}
```

```ts title="index.ts" showLineNumbers
import { createServer } from "dressed";
import * as ping from "./src/commands/ping";

createServer({ ping }, {}, {});
```

Because of this, the remaining examples will use file exports for simplicity/readability, but you can think of them as being placed into the handler object if you're not using the framework.

## File-based routing

In the framework, command names are determined by their file name. Here's a typical command structure:

```sh
src
└ commands
  ├ greet.ts # Will become /greet
  └ trivia.ts # Will become /trivia
```

Because of this, command file names must be globally unique. For example, `src/commands/ping.ts` would conflict with `src/commands/helpers/ping.ts`. The framework will detect this and report it during the build process.

## Command execution

All commands must export a default function. This function serves as the handler executed when the command is triggered.

```ts title="src / commands / greet.ts" showLineNumbers
import type { CommandInteraction } from "dressed";

export default async function (interaction: CommandInteraction) {
  await interaction.reply("Hi there!");
}
```

## Autocomplete

For options that require dynamic suggestions, you can enable autocomplete. Simply create a function named `autocomplete` that returns the choices.

```ts title="src / commands / random.ts" showLineNumbers
import { CommandOption, type CommandConfig } from "dressed";

export const config = {
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
} satisfies CommandConfig;

// Either return the options directly as an array or call interaction.sendChoices()
export const autocomplete = () => [
  { name: "Dog", value: "dog" },
  { name: "Cat", value: "cat" },
];
```

## Context commands

Context commands are super easy to enable: set the `type` property in your command config to `Message`, `User`, or `PrimaryEntryPoint`. The `CommandInteraction` type is generic, allowing you to pass `typeof config` for strict type inference on target properties.

```ts title="src / commands / get-avatar.ts" showLineNumbers
import type { CommandConfig, CommandInteraction } from "dressed";

export const config = { type: "User" } satisfies CommandConfig;

export default function avatar(interaction: CommandInteraction<typeof config>) {
  const user = interaction.target;
  return interaction.reply(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`);
}
```
