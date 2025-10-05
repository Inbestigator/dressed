# Building a custom server

If you want to run a server yourself, or build a Dressed project into a pre-existing ecosystem the default `node:http` server may not cut it. Thankfully Dressed exports many different helpers for you to customize pretty much the whole server functionality.

Here's an example of integrating Dressed into a [Hono](https://hono.dev/) server. See [the deploying guides](/docs/guide/deploying) for more examples.

```ts caption="The handleRequest function takes a Request object and bot data, then runs the interaction and returns a Response object." showLineNumbers
import { commands, components, events, config } from "./.dressed";
import { handleRequest } from "dressed/server";
import { Hono } from "hono";

const app = new Hono();
app.post("/bot", ({ req }) => handleRequest(req.raw, commands, components, events, config));

export default app;
```

The `handleInteraction` function is great for things like initiating a Dressed handler from within a [@dressed/ws](https://www.npmjs.com/package/@dressed/ws) event.

```ts showLineNumbers
import { createInteraction, handleInteraction } from "dressed/server";
import { commands, components, config } from "./.dressed";
import { createConnection } from "@dressed/ws";

const connection = createConnection();

connection.onInteractionCreate((data) => {
  const interaction = createInteraction(data);
  handleInteraction(commands, components, interaction, config.middleware);
});
```
