<div align="center">
  <img src="https://raw.githubusercontent.com/Inbestigator/dressed/main/www/public/dressed.webp" alt="Dressed logo" width="128" />
  <h1>Dressed</h1>
</div>

Dressed is a Discord bot library that allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url) system for Discord.

Discord will send `POST` requests to your bot, instead of the websocket system that other libraries utilize.

One cool feature of Dressed is that you can make **dynamic component IDs**, so that you only need to write one component handler for many different scenarios. 👉 [See more](https://dressed.js.org/docs/components#dynamic-component-ids)

You can find examples of bots ready to deploy on
[Vercel](https://vercel.com) and [Deno Deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-examples).

## 🚀 Usage

```sh
bun add dressed
```

```ts
// src/commands/ping.ts
import type { CommandConfig, CommandInteraction } from "dressed";

export const config = {
  description: "Returns the latency",
} satisfies CommandConfig;

export default async function (interaction: CommandInteraction<typeof config>) {
  const start = Date.now();
  const { resource } = await interaction.deferReply({ ephemeral: true, with_response: true });
  await interaction.editReply(`🏓 ${Date.parse(resource?.message?.timestamp ?? "") - start}ms`);
}
```

You can then build and run the bot with:

```sh
bun dressed build -ir
bun .dressed
```

- By default, the builder outputs only boilerplate data.
- To include an instance creator, add the `-i` flag.
- To register your bot's commands, add the `-r` flag.

For more information on how to create a simple bot, check out [the getting started guide](/docs/guide/getting-started).

Dressed includes a [Node HTTP](https://nodejs.org/api/http.html) server out of the box.
If you'd prefer to create your own, all the functions you need are available within `dressed/server`.
