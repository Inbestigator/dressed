<div align="center">
  <img src="https://raw.githubusercontent.com/Inbestigator/dressed/main/www/public/dressed.webp" alt="Dressed logo" width="128" />
  <h1>Dressed</h1>
</div>

Dressed is a Discord bot library that allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url) system for Discord.

Discord will send `POST` requests to your bot, instead of the websocket system that other libraries utilize.

One cool feature of Dressed is that you can make **dynamic component IDs**, so that you only need to write one component handler for many different scenarios. 👉 [See more](https://dressed.js.org/docs/components#dynamic-component-ids)

You can find examples of bots ready to deploy on
[Cloudflare Workers](https://workers.cloudflare.com/), [Vercel](https://vercel.com), and [Deno Deploy](https://deno.com/deploy) in
[this repo](https://github.com/Inbestigator/dressed-examples).

## 🚀 Usage

```sh
bun add dressed
```

```ts
// index.ts
import { createMessage } from "dressed";

createMessage("<CHANNEL_ID>", "Hello from Dressed!");
```

```sh
bun index.ts
```

For more information on how to create a simple bot, check out [the getting started guide](https://dressed.js.org/docs/guide/getting-started).

Dressed includes a [Node HTTP](https://nodejs.org/api/http.html) server out of the box.
If you'd prefer to create your own, all the functions you need are available within `dressed/server`.
