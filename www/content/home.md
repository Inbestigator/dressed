# Dressed

Dressed allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

Discord will send POST requests to your bot, instead of the websocket system
that Discord.js utilizes.

You can find an example of a bot ready to deploy on
[Deno deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-example).

## Installation

```bash
deno add jsr:@dressed/dressed
```

```ts
// src/commands/ping.ts
import type {
  CommandConfig,
  CommandInteraction,
} from "@dressed/dressed";

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

You can then build the bot with this command

```bash
deno run -A jsr:@dressed/cmd build
```

By default the builder outputs only the boilerplate data, if you want it to
include an instance creator, add `-i` when running the build command.

In order to register the commands for your bot, run the build command with `-r`.

In addition to Dressed, I'd recommend installing
[Discord API Types](https://www.npmjs.com/package/discord-api-types) (The type
lib that Dressed uses internally)

Dressed comes with a serve system for Deno projects, but otherwise you'll
have to BYO (all the Dressed resources needed to do so are available)
[The Node-compatible example](https://github.com/Inbestigator/dressed-example/tree/node)
uses a server made with Express
