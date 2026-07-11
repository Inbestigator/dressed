<div align="center">
  <img src="https://raw.githubusercontent.com/Inbestigator/dressed/main/www/public/dressed.webp" alt="Dressed logo" width="128" />
  <h1>Dressed</h1>
</div>

Dressed is a lightweight Discord API library that provides everything you need to deploy bots using [interaction endpoints](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url), making it ideal for serverless platforms like Cloudflare Workers and AWS Lambda.

It supports [dynamic component IDs](https://dressed.js.org/docs/components#dynamic-component-ids), allowing a single component handler to process many variations of a component.

You can find example bots and templates in [the examples repo](https://github.com/Inbestigator/dressed-examples), perfect for
[Cloudflare Workers](https://workers.cloudflare.com), [Vercel](https://vercel.com), and many more platforms.

## 🚀 Usage

```sh
bun add dressed
```

```ts
// index.ts
import { ActionRow, Button, createMessage } from "dressed";
import { createServer } from "dressed/server";

await createMessage("<CHANNEL_ID>", {
  content: "Hello from Dressed!",
  components: [ActionRow(Button({ custom_id: "click", label: "Click me!" }))],
});

createServer(
  {},
  {
    buttons: {
      click: {
        default: (interaction) => interaction.reply("Hello again!"),
      },
    },
  },
  {},
);
```

```sh
bun index.ts
```

For more information on how to create a simple bot, check out [the getting started guide](https://dressed.js.org/docs/guide/getting-started).

Dressed includes a [Node HTTP](https://nodejs.org/api/http.html) server out of the box.
If you'd prefer to create your own, all the functions you need are available within [`dressed/server`](https://dressed.js.org/docs/custom-servers).
