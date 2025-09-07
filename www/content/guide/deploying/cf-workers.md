# Deploying to Cloudflare Workers

This guide walks you through deploying a Discord bot built with Dressed to [Cloudflare Workers](https://workers.cloudflare.com).

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

## Configuration

1. ```json title="wrangler.json"
   {
     "main": "src/cf.ts",
     "build": {
       "command": "bun dressed build"
     },
     "compatibility_flags": ["nodejs_compat"]
   }
   ```

2. ```ts title="src / cf.ts"
   import {
     handleRequest,
     setupCommands,
     setupComponents,
     setupEvents,
   } from "dressed/server";
   // @ts-ignore Generated after build
   import { commands, components, events, config } from "../.dressed/index.mjs";

   export default {
     fetch: (req, _env, ctx) =>
       handleRequest(
         req,
         async (...p) => ctx.waitUntil(setupCommands(commands)(...p)),
         async (...p) => ctx.waitUntil(setupComponents(components)(...p)),
         async (...p) => ctx.waitUntil(setupEvents(events)(...p)),
         config,
       ),
   };
   ```

## Environment variables

If you are creating a new project, you will need to upload your environment variables to be used by the bot. [Cloudflare documentation](https://developers.cloudflare.com/workers/configuration/environment-variables/).

> [!WARNING]
> Using `waitUntil` will make Cloudflare keep the server running for longer, but they will stop it as soon as your handler's promise resolves, so your handlers should either return promises or await them.
>
> ```ts
> export default async function myCommand(interaction) {
>   interaction.reply("This may not finish because"); // ❌ There's nothing telling the server that something crucial is still happening
>   await interaction.reply("This will always work"); // ✅ // Awaiting makes the server wait for this to finish
>   return interaction.reply("This too"); // ✅ Your handler function is awaited, so returning acts like `await`
> }
> ```

You now can upload it to Cloudflare however you like, either through linking to GitHub, or using the CLI:

```sh
bunx wrangler deploy
```
