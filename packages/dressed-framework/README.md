# @dressed/framework

An opinionated framework for creating Discord bots using [Dressed](https://dressed.js.org).

Because this library is intended primarily for bundling and organizing your handler files, it can be used as a dev dependency.

## 🚀 Usage

```sh
bun add dressed
bun add -d @dressed/framework
```

```ts
// src/commands/ping.ts
import type { CommandConfig, CommandInteraction } from "dressed";

export const config = {
  description: "Checks the API latency",
} satisfies CommandConfig;

export default async function (interaction: CommandInteraction<typeof config>) {
  const start = Date.now();
  const res = await interaction.deferReply({ ephemeral: true, with_response: true });
  const delay = Date.parse(res.resource?.message?.timestamp ?? "") - start;
  await interaction.editReply(`🏓 ${delay}ms`);
}
```

You can then build and run the bot with:

```sh
bun dressed build -ir
bun .dressed
```
