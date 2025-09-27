Dressed is a Discord bot library that allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord. Discord will send POST requests to your bot, instead of the websocket system that other libraries utilize.

For more information on common functions (e.g. [getUser](/docs/resources/user#get-user), [createChannel](/docs/resources/guild#create-channel), etc.), see the resources section.

One cool feature of Dressed is that you can make dynamic component IDs, so that you only need to write one component handler for many different scenarios. [See more](/docs/components#dynamic-component-ids)

## Quick usage

```sh
bun add dressed
```

```ts title="index.ts"
import { createMessage } from "dressed";

createMessage("<CHANNEL_ID>", "Hello from Dressed!");
```

```sh
bun index.ts
```

For more information on how to create a simple bot, check out [the getting started guide](/docs/guide/getting-started). You can find an example of some bots ready to deploy on [Vercel](https://vercel.com) and [Deno deploy](https://deno.com/deploy) in [this repo](https://github.com/Inbestigator/dressed-examples).

Dressed includes a [Node HTTP](https://nodejs.org/api/http.html) server out of the box.
If you'd prefer to create your own, all the functions you need are available within `dressed/server`.
