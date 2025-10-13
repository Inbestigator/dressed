# Deploying to Cloudflare Workers

This guide walks you through deploying a Discord bot built with Dressed to [Cloudflare Workers](https://workers.cloudflare.com).

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

## Setup

1. If you don't have a workers project yet, create a [`wrangler.jsonc`](https://developers.cloudflare.com/workers/wrangler/configuration/) file:
   ```jsonc title="wrangler.jsonc"
   {
     "name": "", // The name of your worker. Alphanumeric characters and dashes only
     "compatibility_date": "" // Today's date as: yyyy-mm-dd
   }
   ```
2. Add the following to your `wrangler.jsonc`:

   ```jsonc title="wrangler.jsonc"
   "main": "src/index.ts",
   "build": { "command": "dressed build" },
   "compatibility_flags": ["nodejs_compat"]
   ```

3. Create or update `src/index.ts`:

   ```ts title="src / index.ts"
   // @ts-ignore Generated after build
   import { commands, components, events, config } from "../.dressed";
   import { handleRequest, setupCommands, setupComponents, setupEvents } from "dressed/server";

   export default {
     fetch: (req: Request, _env: never, ctx: { waitUntil: <T>(f: T) => T }) =>
       handleRequest(
         req,
         (...p) => ctx.waitUntil(setupCommands(commands)(...p)),
         (...p) => ctx.waitUntil(setupComponents(components)(...p)),
         (...p) => ctx.waitUntil(setupEvents(events)(...p)),
         config
       ),
   };
   ```

## Environment variables

If you are creating a new project, you will need to upload the environment variables `DISCORD_PUBLIC_KEY`, `DISCORD_TOKEN`, and `DISCORD_APP_ID`. [Cloudflare documentation](https://developers.cloudflare.com/workers/configuration/environment-variables/).

Here is an example of how you could add them:

- Development: `.env` file
- Production: `bunx wrangler secret put <SECRET_NAME>`

## Upload

You now can upload it to Cloudflare however you like, either through linking to GitHub, or using the CLI:

```sh
bunx wrangler deploy
```

Your bot should now be accessible at `<project>.<user>.workers.dev`.
