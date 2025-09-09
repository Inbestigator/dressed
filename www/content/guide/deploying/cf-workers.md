# Deploying to Cloudflare Workers

This guide walks you through deploying a Discord bot built with Dressed to [Cloudflare Workers](https://workers.cloudflare.com).

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

## Setup

1. Add the following to your `wrangler.toml` file:

   ```toml title="wrangler.toml"
   main = "src/cf.ts"
   compatibility_flags = [ "nodejs_compat" ]
   build.command = "dressed build"
   ```

2. ```ts title="src / cf.ts"
   // @ts-ignore Generated after build
   import { commands, components, events, config } from "../.dressed";
   import { handleRequest } from "dressed/server";

   export default {
     fetch: (req: Request) =>
       handleRequest(req, commands, components, events, config),
   };
   ```

## Environment variables

If you are creating a new project, you will need to upload your environment variables to be used by the bot. [Cloudflare documentation](https://developers.cloudflare.com/workers/configuration/environment-variables/).

## Upload

You now can upload it to Cloudflare however you like, either through linking to GitHub, or using the CLI:

```sh
bunx wrangler deploy
```

Your bot should now be accessible at `<project>.<user>.workers.dev`.
