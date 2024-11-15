# Discord-http

Discord-http allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

Discord will send POST requests to your bot, instead of the websocket system
that Discord.js utilizes

You can find an example of a bot ready to deploy on
[Deno deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/discord-http-example).

## Installation

```bash
deno add jsr:@inbestigator/discord-http
```

```ts
import type {
  CommandConfig,
  CommandInteraction,
} from "@inbestigator/discord-http";

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

By default the builder outputs only the boilerplate data, if you want it to
include an instance creator, add `-i` when running the build script.

In order to register the commands for your bot, run the build script with `-r`.

In addition to Discord-http, I'd recommend installing
[Discord API Types](https://www.npmjs.com/package/discord-api-types) (The type
lib that Discord-http uses internally)

Discord-http comes with a serve system for Deno projects, but otherwise you'll
have to BYO (all the Discord-http resources needed to do so are available)
[The Node-compatible example](https://github.com/Inbestigator/discord-http-example/tree/node)
uses a server made with Express
