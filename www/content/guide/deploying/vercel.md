# Deploying to Vercel

This guide walks you through deploying a Discord bot built with Dressed to [Vercel](https://vercel.com), either as a standalone project or inside a Next.js app.

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

Both project systems use the `@dressed/next` package, this will make sure that Vercel handles your requests correctly. To install it you can use whatever package manager you like, but these guides use [Bun](https://bun.sh).

```sh
bun add @dressed/next
```

> [!WARNING]
> Vercel stops the server as soon as your handler's promise resolves, so your handlers should either return promises or await them.
>
> They also forcefully stop the server execution after 10 seconds if you're using their free plan.
>
> ```ts
> export default async function myCommand(interaction) {
>   interaction.reply("This may not finish because"); // ❌ There's nothing telling the server that something crucial is still happening
>   await interaction.reply("This will always work"); // ✅ // Awaiting makes the server wait for this to finish
>   return interaction.reply("This too"); // ✅ Your handler function is awaited, so returning acts like `await`
> }
> ```

## Standalone Deployment ([Vercel Functions](https://vercel.com/docs/functions/))

1. ```json title="vercel.json"
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "buildCommand": "bun dressed build",
     "outputDirectory": ".dressed"
   }
   ```

2. ```ts title="api / bot.ts"
   import createHandler from "@dressed/next";
   // @ts-ignore Generated after build
   import { commands, components, events, config } from "../.dressed/index.mjs";

   export const POST = createHandler(commands, components, events, config);
   ```

---

## Next.js Projects

If you’re using Next.js, you don’t need a `vercel.json` file. The Next.js framework preset will handle config automatically. Just add an API route:

```ts title="app / api / bot / route.ts"
import createHandler from "@dressed/next";
// @ts-ignore Generated after build
import { commands, components, events, config } from "../../../.dressed";

export const POST = createHandler(commands, components, events, config);
```

> [!IMPORTANT]
> Make sure your build script builds your bot files before your Next.js project, like so:
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

You now can upload it to Vercel however you like, either through linking to GitHub, or using the CLI:

```sh
bun add -g vercel
vercel --prod
```
