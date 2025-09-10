# Building a custom server

If you want to run a server yourself, or build a Dressed project into a pre-existing ecosystem the default `node:http` server may not cut it.

Thankfully Dressed exports many different helpers for you to customize pretty much the whole server functionality.

Here's an example of integrating Dressed into a [Hono](https://hono.dev/) server.

```ts caption="The handleRequest function takes a Request object and bot data, then runs the interaction and returns a Response object." showLineNumbers
import { commands, components, events, config } from "./.dressed";
import { handleRequest } from "dressed/server";
import { Hono } from "hono";

const app = new Hono();
app.post("/", ({ req }) =>
  handleRequest(req.raw, commands, components, events, config),
);

export default app;
```

You can always change how the interactions are determined, like in this minimalist extension of the previous example that will always run a command from the request. Doing something like this is discouraged as it's not checking the request security.

```ts caption="Commands, components, and events each have a setup function that returns a function to run one. The createInteraction function preps the interaction for use in a handler, by adding the response methods and asserting the user key." showLineNumbers
import type { APIApplicationCommandInteraction } from "discord-api-types/v10";
import { createInteraction, setupCommands } from "dressed/server";

const runCommand = setupCommands(commands);

const app = new Hono();
app.post("/", async ({ req }) => {
  const json = await req.json();
  const interaction = createInteraction(
    json as APIApplicationCommandInteraction,
  );
  await runCommand(interaction);
  return new Response(null, { status: 202 });
});
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
