# Dressed

Dressed is a wrapper around the Discord API. It allows you to host a bot using
the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

Discord will send POST requests to your bot, instead of the websocket system
that Discord.js utilizes.

Dressed also allows for a dynamic component ID system, so that you only need to
write one component handler for many different scenarios.
[See more](https://dressed.vercel.app/docs/components#dynamic-component-ids)

You can find an example of a bot ready to deploy on
[Deno deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-example).

```ts
import type { CommandConfig, CommandInteraction } from "@dressed/dressed";

export const config: CommandConfig = {
  description: "Returns pong",
};

export default async function ping(interaction: CommandInteraction) {
  await interaction.reply({
    content: "Pong!",
  });
}
```

By default the builder outputs only the boilerplate data, if you want it to
include an instance creator, add `-i` when running the build command.

In order to register the commands for your bot, run the build command with `-r`.

Here's the build script I use for testing non-Deno environments (where afaik I
can't use the cli):

```ts
import { build } from "@dressed/dressed";
import { writeFileSync } from "fs";

async function genBot() {
  //                                 -i    -r
  const outputContent = await build(true, false);
  writeFileSync("./bot.gen.ts", new TextEncoder().encode(outputContent));
  console.log("Wrote to bot.gen.ts");
}

genBot();
```

Dressed comes with a serve system for Deno projects, but otherwise you'll have
to BYO (all the Dressed resources needed to do so are available).
[The Node-compatible example](https://github.com/Inbestigator/dressed-example/tree/node)
uses a server made with Express.
