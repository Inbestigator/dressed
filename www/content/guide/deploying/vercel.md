# Deploying to Vercel

This guide walks you through deploying a Discord bot built with Dressed to [Vercel](https://vercel.com), either as a standalone project or inside a Next.js app.

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

## Standalone Deployment ([Vercel Functions](https://vercel.com/docs/functions/))

1. ```json title="vercel.json"
   {
     "buildCommand": "dressed build",
     "outputDirectory": ".dressed"
   }
   ```

2. ```ts title="api / bot.ts"
   // @ts-ignore Generated after build
   import { commands, components, events, config } from "../.dressed/index.mjs";
   import { handleRequest } from "dressed/server";

   export const POST = (req: Request) =>
     handleRequest(req, commands, components, events, config);
   ```

---

## Next.js Projects

If you’re using Next.js, you don’t need a `vercel.json` file. The Next.js framework preset will handle config automatically. Just add an API route:

```ts title="app / api / bot / route.ts"
// @ts-ignore Generated after build
import { commands, components, events, config } from "../../../.dressed";
import { handleRequest } from "dressed/server";

export const POST = (req: Request) =>
  handleRequest(req, commands, components, events, config);
```

> [!IMPORTANT]
> Make sure your build script bundles your bot files before your Next.js project, like so:
>
> ```json title="package.json"
> {
>   "scripts": {
>     "build": "dressed build && next build"
>   }
> }
> ```

---

## Environment variables

If you are creating a new project, you will need to upload your environment variables to be used by the bot. [Vercel documentation](https://vercel.com/docs/environment-variables).

## Upload

You now can upload it to Vercel however you like, either through linking to GitHub, or using the CLI:

```sh
bunx vercel --prod
```

Your bot should now be accessible at `<project>.vercel.app/api/bot`.
