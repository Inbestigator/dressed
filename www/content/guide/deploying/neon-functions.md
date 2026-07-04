# Deploying to Neon Functions

This guide walks you through deploying a Discord bot built with Dressed to [Neon Functions](https://neon.com/docs/compute/functions/overview).

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

> [!WARNING]
> Neon Functions are currently in private preview. They are available for new Neon projects in the AWS `us-east-2` region created on or after June 15, 2026. Check the [Neon preview access docs](https://neon.com/docs/compute/functions/preview-access) before relying on this in production.

## Setup

1. Install the Neon config package and the Neon Functions runtime helper:

   ```sh
   bun add @neon/config @neon/functions
   ```

2. Create a Neon function entrypoint:

   ```ts title="functions / discord.ts"
   import { waitUntil } from "@neon/functions";
   import { handleRequest, setupCommands, setupComponents, setupEvents } from "dressed/server";
   // @ts-ignore Generated after build
   import { commands, components, events } from "../.dressed/index.js";

   const interactionsPath = "/api/interactions";
   const runCommand = setupCommands(commands);
   const runComponent = setupComponents(components);
   const runEvent = setupEvents(events);

   export default (req: Request) => {
     const url = new URL(req.url);

     if (req.method === "GET") {
       return Response.json({
         ok: true,
         interactionsUrl: `${url.origin}${interactionsPath}`,
       });
     }

     if (url.pathname !== interactionsPath) {
       return new Response(null, { status: 404 });
     }

     return handleRequest(
       req,
       (...p) => {
         waitUntil(runCommand(...p));
         return Promise.resolve();
       },
       (...p) => {
         waitUntil(runComponent(...p));
         return Promise.resolve();
       },
       (...p) => {
         waitUntil(runEvent(...p));
         return Promise.resolve();
       },
     );
   };
   ```

3. Add a `neon.ts` config file:

   ```ts title="neon.ts"
   import { defineConfig } from "@neon/config/v1";

   export default defineConfig({
     preview: {
       functions: {
         discord: {
           name: "Discord interactions",
           source: "./functions/discord.ts",
           env: {
             DISCORD_TOKEN: process.env.DISCORD_TOKEN ?? "",
             DISCORD_APP_ID: process.env.DISCORD_APP_ID ?? "",
             DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY ?? "",
           },
           dev: {
             port: 8787,
           },
         },
       },
     },
   });
   ```

4. Add a build script to your `package.json`:

   ```json title="package.json"
   {
     "scripts": {
       "build": "dressed build",
       "dev": "neon dev",
       "deploy": "bun run build && neon deploy --env .env",
       "endpoint": "neon functions get discord",
       "register:commands": "dressed build -r"
     }
   }
   ```

## Environment variables

If you are creating a new project, you will need to provide `DISCORD_PUBLIC_KEY`, `DISCORD_TOKEN`, and `DISCORD_APP_ID` when deploying. The `env` values in `neon.ts` are resolved when `neon deploy` runs, so load them from your shell or an env file:

```env title=".env"
DISCORD_PUBLIC_KEY=
DISCORD_TOKEN=
DISCORD_APP_ID=
```

```sh
neon deploy --env .env
```

Neon automatically injects branch-scoped variables such as `DATABASE_URL` into deployed functions. You do not need to add those to `env`.

## Register commands

Register your slash commands with Discord:

```sh
bun run register:commands
```

This uses the Dressed command data from your project and the Discord variables in `.env`.

## Local development

Run the Neon local dev server:

```sh
bun run build
bun run dev
```

With the `dev.port` setting above, the local function runs at `http://localhost:8787`. Use a public HTTPS tunnel if you want Discord to call your local machine.

## Upload

Link your project once:

```sh
neon link
```

Then deploy the bot:

```sh
bun run deploy
```

After deployment, retrieve the public URL:

```sh
bun run endpoint
```

Append `/api/interactions` to the returned `invocation_url` and use that as your Discord interactions endpoint. The function also returns this full URL from `GET /`.

> [!TIP]
> Neon function slugs must use lowercase letters and digits only, with a maximum length of 20 characters. `discord` works, but `discord-bot` does not.
