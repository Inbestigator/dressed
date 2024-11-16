# Components

The component ids are determined by their file name, here's a typical component
structure:

```ts
src
├── components
│   └── buttons
│       ├── increase.ts // Will handle for buttons with ID `increase`
│       └── trivia_guess_[answer].ts // Will handle for buttons with ID `trivia_guess_[answer]`
```

This means that component file names must be unique within their category.

The component categories available are buttons, selects, and modals.

## Component execution

All components are required to have a default export, this function is how your
component will be handled.

```ts
import type { ComponentInteraction } from "discord-http";

export default async function triviaGuess(
  interaction: ComponentInteraction,
  args: { answer: string }
) {
  if (args.answer === correctAnswer) {
    await interaction.reply("Good job!");
  } else {
    await interaction.reply("Nice try!");
  }
}
```

## Dynamic component IDs

As you may have noticed in the previous example, a component can be passed
certain arguments.

If your component has `[<argname>]` in its ID, components matching that regex
are executed with this handler, the handler will be passed an object with the
value (always string) that matches the argument.

Example:

```
print_[value].ts -> Will match print_(.+)
action_[action]_execute.ts -> Will match action_(.+)_execute
```

```ts
export default async function print(_, args: { value: string }) {
  console.log(value);
}
```
