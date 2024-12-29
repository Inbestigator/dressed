# Command Config

Each command can optionally export a `config` object.

```ts
import type { CommandConfig } from "@dressed/dressed";
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

Dressed supports all of the [Discord application command object](https://discord.com/developers/docs/interactions/application-commands#application-command-object)
