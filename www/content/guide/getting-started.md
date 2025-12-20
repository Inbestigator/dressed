# Getting started

This assumes that you have created your bot on the Discord Dev dashboard, have obtained your token, and have added it to a guild.

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

Now open your `.gitignore` file and add a new line ".dressed" at the end, Dressed bundles your files into JavaScript for use at runtime, they and some information data are outputted in a `.dressed` folder.

For this guide, our files wil be laid out according to the opinionated file system similarly to this:

```sh
src
├ commands # Any files here are turned into commands
│ └ trivia.ts # Will become /trivia
├ components # Files within these folders handle the corresponding component types
│ ├ buttons
│ │ └ trivia_guess_:answer.ts # See /docs/components#dynamic-component-ids about this
│ ├ modals
│ │ └ suggestion.ts # Will handle modals with the custom_id of `suggestion`
│ └ selects
│   └ rating.ts
└ events # The files here handle events, the name of the file is the event it is triggered by
  └ ApplicationAuthorized.ts
```

## Ping command

To create a command, all you have to do is create a file within `src/commands`. The command will be named after the file, so in this case we'll name it `ping.ts`.

Command handlers in Dressed are exported as the default function from your file.

```ts title="src / commands / ping.ts" showLineNumbers
import type { CommandInteraction } from "dressed";

// The function name can be whatever you want
// Technically you don't even need to specify the name
export default function pingCommand(interaction: CommandInteraction) {
  interaction.reply("Pong!"); // This will send a simple message back to the user
}
```

This is all we need; you can now register the command to Discord!

### Register commands

Dressed has a built in function named `installCommands` that will create commands from your files. Using `-r` in the `dressed build` command automatically includes it in the output file.

```sh
bun dressed build -r
bun .dressed # This runs the outputted file with the `installCommands` function
```

Now if you refresh your Discord client, you should see that the new `/ping` command has appeared.

But we don't just want to see the command, we want to run it!

### Start bot

Now you can start the bot and make it listen for requests from Discord. Like `-r`, you can use the `-i` flag to make the output include a function to start a server (`createServer`).

```sh
bun dressed build -i
bun .dressed
# It should say that the bot is listening
```

Now, to make it so that Discord knows where to send the interactions, you have to [forward the port](https://wikipedia.org/wiki/Port_forwarding) to a public system. There are multiple methods to do this, but personally I use [the one built into VSCode](https://code.visualstudio.com/docs/debugtest/port-forwarding).

Once you've forwarded the port, you should be able to go to the URL and it'll return either a `405` or `404` code (so long as your bot is running).

Copy that address and paste it into the `Interactions Endpoint URL` field for your application on the Discord Developer dashboard.

After saving, you should be able to run `/ping` and it'll reply with "Pong!"

To continue with this bot and create a counter command, go [here](/docs/guide/counter).
