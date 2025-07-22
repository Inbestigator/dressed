# Command Options

Options are defined in your [command config](/docs/commands/config) and are filled in by users to be sent with the interaction.

You can access options using the `getOption` function on `interaction`.

```ts
import {
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
} from "dressed";

export const config: CommandConfig = {
  options: [
    CommandOption({
      name: "required",
      description: "This is required",
      type: "String",
      required: true,
    }),
    CommandOption({
      name: "optional",
      description: "This is optional",
      type: "String",
    }),
  ],
};

export default function (interaction: CommandInteraction) {
  const required = interaction.getOption("required", true).string(); // string
  const optional = interaction.getOption("optional")?.string(); // string | undefined
}
```

A required option will throw an error if it's missing.

### Subcommands

Subcommands are a special type of option as they can contain further options, while they do have the required prop in the `CommandOption` function, Discord will fail if you try to use it.

```ts
import {
  type CommandConfig,
  type CommandInteraction,
  CommandOption,
} from "dressed";

export const config: CommandConfig = {
  options: [
    CommandOption({
      name: "foo",
      description: "A subcommand",
      type: "Subcommand",
      options: [
        CommandOption({
          name: "baz",
          description: "Enter a big number",
          type: "Number",
          required: true,
        }),
      ],
    }),
    CommandOption({
      name: "group",
      description: "A subcommand group",
      type: "SubcommandGroup",
      options: [
        CommandOption({
          name: "bar",
          description: "Another subcommand",
          type: "Subcommand",
        }),
      ],
    }),
  ],
};

export default function (interaction: CommandInteraction) {
  const foo = interaction.getOption("foo")?.subcommand();
  const bar = interaction
    .getOption("group")
    ?.subcommandGroup()
    .getSubcommand("bar");
  if (bar) {
    return interaction.reply("Bar");
  } else if (foo) {
    const baz = foo.getOption("baz", true).number();
    return interaction.reply(`${baz} is a pretty big number!`);
  }
}
```
