# Deploying to Vercel

This guide walks you through deploying a Discord bot built with Dressed to [Vercel](https://vercel.com), either as a standalone project or inside a Next.js app.

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

Both project systems use the `@dressed/next` package, this will make sure that Vercel handles your requests correctly. To install it you can use whatever package manager you like, but these guides use [Bun](https://bun.sh).

```sh
bun add @dressed/next
```

## Standalone Deployment ([Vercel Functions](https://vercel.com/docs/functions/))

1. Create a `vercel.json` file in the root of your project:

   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "buildCommand": "bun dressed build",
     "outputDirectory": ".dressed"
   }
   ```

2. Create a file at `./api/bot.ts`:

   ```ts
   // api/bot.ts
   import createHandler from "@dressed/next";
   // @ts-ignore – generated after build
   import { commands, components, events, config } from "../.dressed/index.mjs";

   export const POST = createHandler(commands, components, events, config);
   ```

---

## Next.js Projects

If you’re using Next.js, you don’t need a `vercel.json` file. Vercel’s Next.js preset will handle it automatically. Just add an API route:

```ts
// app/api/bot/route.ts
import createHandler from "@dressed/next";
// @ts-ignore – generated after build
import { commands, components, events, config } from "../../../.dressed";

export const POST = createHandler(commands, components, events, config);
```

### Important

Make sure your build script builds your bot files before your Next.js project.
For example, in package.json:

```json
{
  "scripts": {
    "build": "dressed build && next build"
  }
}
```

---

You now can upload it to Vercel however you like, either through linking to GitHub, or using their [CLI](https://vercel.com/docs/cli).
