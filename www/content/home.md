# Dressed

Dressed is a Discord bot framework with 100% API support. It allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

For more information on common functions (e.g. getUser, createChannel, etc.), see [the docs on JSR](https://jsr.io/@dressed/dressed/doc)

Discord will send POST requests to your bot, instead of the websocket system
that Discord.js utilizes.

One cool feature of Dressed is that you can make dynamic component IDs, so that you only need to write one component handler for many different scenarios. [See more](https://dressed.vercel.app/docs/components#dynamic-component-ids)

You can find an example of some bots ready to deploy on
[Vercel](https://vercel.com) and [Deno deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-examples).

## Installation

```bash
bun add dressed
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

You can then build and run the bot with this command

```bash
bun dressed build -ir
bun bot.gen.ts
```

By default the builder outputs only boilerplate data, if you want it to
include an instance creator, add `-i` when running the build command.

In order to register the commands for your bot, you can run the build command with `-r`.

In addition to Dressed, I'd recommend installing
[Discord API Types](https://www.npmjs.com/package/discord-api-types) (The type
lib that Dressed uses internally).

Dressed comes with a [Node HTTP](https://nodejs.org/api/http.html) server OOB, if you'd like to make your own,
all the functions needed to do so are available in `dressed/server`.
