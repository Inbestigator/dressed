# Commands

The command names are determined by their file name, here's a typical command
structure:

```ts
src
├── commands
│   ├── greet.ts // Will become /greet
│   └── trivia.ts // Will become /trivia
```

This means that command file names must be globally unique.

## Command execution

All commands are required to have a default export, this function is how your
command will be handled.

```ts
import type { CommandInteraction } from "discord-http";

export default async function greet(interaction: CommandInteraction) {
  await interaction.reply("Hi there!");
}
```