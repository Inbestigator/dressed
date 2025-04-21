# Command Config

Each command can optionally export a `config` object.

```ts
import { type CommandConfig, CommandOption } from "@dressed/dressed";

export const config: CommandConfig = {
  description: "Send a random adorable animal photo",
  options: [
    CommandOption({
      name: "animal",
      description: "The type of animal",
      type: "String",
      required: true,
    }),
  ],
};
```

## Config type

The config object supports all of the [Discord application command option type](https://discord.com/developers/docs/interactions/application-commands#application-command-object).
