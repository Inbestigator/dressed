# Deploying to Netlify Functions

This guide walks you through deploying a Discord bot built with Dressed to [Netlify Functions](https://www.netlify.com/platform/core/functions/).

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

## Setup

1. Add the following to your `netlify.toml` file:

   ```toml title="netlify.toml"
   build.command = "dressed build"
   ```

2. ```ts title="netlify / functions / bot.mts"
   // @ts-ignore Generated after build
   import { commands, components, events } from "../../.dressed";
   import { handleRequest } from "dressed/server";

   export default (req: Request) => handleRequest(req, commands, components, events);
   ```

## Environment variables

If you are creating a new project, you will need to upload your environment variables to be used by the bot. [Netlify documentation](https://docs.netlify.com/build/environment-variables/overview/).

## Upload

You now can upload it to Netlify however you like, either through linking to GitHub, or using the CLI:

```sh
bunx netlify build
bunx netlify deploy --prod
```

Your bot should now be accessible at `<project>.netlify.app/.netlify/functions/bot`.
