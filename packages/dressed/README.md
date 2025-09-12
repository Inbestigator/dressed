<div align="center">
  <img src="https://raw.githubusercontent.com/Inbestigator/dressed/main/www/public/dressed.webp" alt="Dressed logo" width="128" />
  <h1>Dressed</h1>
</div>

Dressed is a Discord bot framework with 100% API support. It allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

Discord will send `POST` requests to your bot, instead of using the WebSocket system that libraries like Discord.js rely on.

One cool feature of Dressed is support for **dynamic component IDs**, so you only need to write one component handler for many different scenarios.
👉 [See more](https://dressed.js.org/docs/components#dynamic-component-ids)

You can find examples of bots ready to deploy on
[Vercel](https://vercel.com) and [Deno Deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-examples).

## 🚀 Usage

```sh
bun add dressed
# or
deno add jsr:@dressed/dressed
```

```ts
// src/commands/ping.ts
import type { CommandConfig, CommandInteraction } from "dressed";

export const config: CommandConfig = {
  description: "Returns pong",
};

export default async function (interaction: CommandInteraction) {
  await interaction.reply({
    content: "Pong!",
    ephemeral: true,
  });
}
```

You can then build and run the bot with:

```sh
bun dressed build -ir
bun .dressed
# or
deno -A npm:dressed build -ir
deno -A .dressed/index.mjs
```

- By default, the builder outputs only boilerplate data.
- To include an instance creator, add the `-i` flag.
- To register your bot's commands, add the `-r` flag.

> [!TIP]
> For a better development experience, install [Discord API Types](https://www.npmjs.com/package/discord-api-types).

Dressed includes a [Node HTTP](https://nodejs.org/api/http.html) server out of the box.
If you'd prefer to create your own, all the functions you need are available within `dressed/server`.
