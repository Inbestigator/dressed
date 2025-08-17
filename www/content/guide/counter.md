# Counter

Now that you know the basics of creating a command, let's get into a more complex system, that will use buttons too.

## Command

Create a new file within `./src/commands` named `counter.ts`.

Now, let's add some functionality. We'll start with a simple message which will later get incremented. The reply will also use a flag (`1 << 15`), this tells Discord that the message is using Components V2.

```ts
import { TextDisplay, type CommandInteraction } from "dressed";

export default function counterCommand(interaction: CommandInteraction) {
  interaction.reply({
    components: [TextDisplay("Current count: 1")],
    ephemeral: true,
    flags: 1 << 15, // If you install `discord-api-types` you can use MessageFlags.IsComponentsV2 instead
  });
}
```

So that user's know what the command does, you should add some config.

```ts
import {
  TextDisplay,
  type CommandConfig,
  type CommandInteraction,
} from "dressed";

export const config: CommandConfig = {
  description: "Shows a counter",
};
```

Now it's time to register the command and start listening.

```bash
bun dressed build -ir
bun .dressed
```

But just displaying a number is no fun at all!

To improve on this, we'll add two buttons, one to increment, and one to reset to 0.

Let's make a new function named `countDisplay` and export it:

```ts
export function countDisplay(n: number) {
  return [
    TextDisplay(`Current count: ${n}`),
    ActionRow(
      Button({
        label: "Add",
        custom_id: `set-counter-${n + 1}`,
      }),
      Button({
        label: "Reset",
        style: "Danger",
        custom_id: "set-counter-0",
      }),
    ),
  ];
}
```

You can now replace the `[TextDisplay("1")]` in your original handler with `countDisplay(1)`.

## Button

In order to handle button interactions, we need to make a handler file.

Start by creating a file within `./src/components/buttons` named `set-counter-:value.ts`.

> [!IMPORTANT]
> If you are on Windows, you will encounter issues with filenames containing colons and other dynamic ID characters. You can do this instead:
>
> ```ts
> // ./src/components/buttons/set-counter.ts
> export const pattern = "set-counter-:value";
> ```

```ts
import type { MessageComponentInteraction } from "dressed";
import { countDisplay } from "../../commands/counter.ts";

export default function setCounterButton(
  interaction: MessageComponentInteraction,
  { value }: { value: string },
) {
  interaction.update({ components: countDisplay(Number(value)) });
}
```

This one handler will now take care of both the `Add` and `Reset` buttons, the value comes from that `:value` in the filename/pattern. [More info about dynamic IDs](https://dressed.vercel.app/docs/components#dynamic-component-ids).
