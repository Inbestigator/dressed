# Deploying

These are some guides for helping you deploy your bots on various serverless providers.

> [!TIP]
> While the examples should function without it, setting `"type": "module"` in your `package.json` may be helpful.

- [Vercel](/docs/guide/deploying/vercel)
- [Cloudflare Workers](/docs/guide/deploying/cf-workers)
- [Deno Deploy](/docs/guide/deploying/deno-deploy)
- [Netlify](/docs/guide/deploying/netlify)

> [!WARNING]
> Most serverless providers stop the server as soon as your handler's promise resolves, so your handlers should either return promises or await them.
>
> ```ts
> export default async function myCommand(interaction) {
>   interaction.reply("This may not finish because"); // ❌ There's nothing telling the server that something crucial is still happening
>   await interaction.reply("This will always work"); // ✅ // Awaiting makes the server wait for this to finish
>   return interaction.reply("This too"); // ✅ Your handler function is awaited, so returning acts like `await`
> }
> ```
