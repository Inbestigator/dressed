![Dressed](www/public/dressed_small.webp)

# Dressed

Dressed is a Discord bot framework with 100% API support. It allows you to host
a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

Discord will send POST requests to your bot, instead of the websocket system
that Discord.js utilizes.

One cool feature of Dressed is that you can make dynamic component IDs, so that
you only need to write one component handler for many different scenarios.
[See more](https://dressed.vercel.app/docs/components#dynamic-component-ids)

You can find an example of some bots ready to deploy on
[Deno deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-examples).

## Installation

```bash
deno add jsr:@dressed/dressed
```

```ts
// src/commands/ping.ts
import type { CommandConfig, CommandInteraction } from "@dressed/dressed";

export const config: CommandConfig = {
  description: "Returns pong",
};

export default async function ping(interaction: CommandInteraction) {
  await interaction.reply({
    content: "Pong!",
    ephemeral: true,
  });
}
```

You can then build and run the bot with this command

```bash
deno -A jsr:@dressed/cmd build -ir
deno -A bot.gen.ts
```

By default the builder outputs only boilerplate data, if you want it to include
an instance creator, add `-i` when running the build command.

In order to register the commands for your bot, also run the build command with
`-r` (requires `-i`).

In addition to Dressed, I'd recommend installing
[Discord API Types](https://www.npmjs.com/package/discord-api-types) (The type
lib that Dressed uses internally).

Dressed comes with an Express serve system OOB, if you'd like to make your own,
all the functions needed to do so are available in `@dressed/dressed/server`.
