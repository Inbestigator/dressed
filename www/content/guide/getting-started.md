# Getting started

This guide will use [Bun](https://bun.sh/) and [TypeScript](https://www.typescriptlang.org/).

This also assumes that you have created your bot on the Discord Dev dashboard, have obtained your token, and have added it to a guild.

## Init

To initialize your project, you can run these commands:

```sh
bun init my-bot # Select the 'Blank' option
cd my-bot
bun add dressed
```

You can now create a file named `.env`, and place your token in it like this:

```env
DISCORD_TOKEN="<your bot token>"
```

Now open your `.gitignore` file and add a new line ".dressed" at the end.

For this guide, our files wil be laid out according to the opinionated server system.

## Ping command

To create a command, all you have to do is create a file within `./src/commands`. The command will be named after the file.

For a start, let's make a simple ping command. You can start by creating the file: `./src/commands/ping.ts`

Command handlers in Dressed are exported as the default function from your file.

```ts
// The function name can be whatever you want
// Technically you don't even need to specify the name
export default function pingCommand() {}
```

This is all we need; you can now register the command to Discord!

### Register commands

```bash
bun dressed build -r
bun .dressed
```

Now if you refresh your Discord client, you should see that the new `/ping` command has appeared.

But we don't just want to see the command, we want to run it!

First, we'll start by adding some logic to our handler function.

```ts
import type { CommandInteraction } from "dressed";

export default function pingCommand(interaction: CommandInteraction) {
  interaction.reply("Pong!");
}
```

### Start bot

Now you can start the bot and make it listen for requests from Discord.

```bash
bun dressed build -i
bun .dressed
# It should say that the bot is listening
```

Now, to make it so that Discord knows where to send the interactions, you have to forward the port to a public system. There are multiple methods to do this, but personally I use the one in VSCode.

Now that it's forwarded, you should be able to go to the URL and it'll return a `405` code (so long as your bot is running).

Copy that address and paste it into the `Interactions Endpoint URL` field for your application on the Discord Developer dashboard.

After saving, you should be able to run `/ping` and it'll reply with "Pong!"

To continue with this bot and create a counter command, go [here](https://dressed.vercel.app/docs/guide/counter)
