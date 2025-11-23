# Deploying to Deno Deploy

This guide walks you through deploying a Discord bot built with Dressed to [Deno Deploy](https://deno.com/deploy).

Deploying is the last step in building your bot, it will be where Discord can send interactions and events even when you're not developing it.

## Configuration

To get Dressed working, all you need to do is:

1. Add `deno -A npm:dressed build -i` to the build command
2. Set `.dressed/index.mjs` as the entrypoint

## Environment variables

If you are creating a new project, you will need to upload your environment variables to be used by the bot. To add your env vars, go to your project settings and click the edit button in the `Environment Variables` section.

## Upload

You now can upload it to Deno Deploy however you like, either through linking to GitHub, or using the CLI:

```sh
deno -A jsr:@deno/deployctl deploy
```

Your bot should now be accessible at `<project>.<user>.deno.net`.
