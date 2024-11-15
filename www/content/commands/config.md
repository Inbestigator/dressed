# Command Config

Each command can optionally export a `config` object.

```ts
import type { CommandConfig } from "@inbestigator/discord-http";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export const config: CommandConfig = {
  description: "Send a random adorable animal photo",
  options: [
    {
      name: "animal",
      description: "The type of animal",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};
```

## Config type

### Description - _string_

A description sets the command description when running it in Discord.

### Options - _array_

Options is an array of
[Discord application command options](https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-structure)
