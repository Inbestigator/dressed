# Discord-http

Discord-http allows you to host a bot using the
[interactions endpoint](https://discord.com/developers/docs/interactions/overview#configuring-an-interactions-endpoint-url)
system for Discord.

Discord will send POST requests to your bot, instead of the websocket system
that Discord.js utilizes

> [!NOTE]\
> To automagically create a bot, run the command
>
> ```bash
> deno run -A jsr:@inbestigator/discord-http/cmd create-new
> ```

In order to register the commands for your bot, run the start script with `-r`

```ts
import type {
  CommandConfig,
  CommandInteraction,
} from "@inbestigator/discord-http";

export const config: CommandConfig = {
  description: "Returns pong",
};

export default async function ping(interaction: CommandInteraction) {
  await interaction.reply({
    content: "Pong!",
    ephemeral: true,
  });
}
```
