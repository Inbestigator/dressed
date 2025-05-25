# Components

The component IDs are determined by their file name, here's a typical component
structure:

```sh
src
└ components
  ├ buttons
  │ ├ increase.ts # Will handle for buttons with ID `increase`
  │ └ trivia_guess_:answer.ts # Will handle for buttons with ID `trivia_guess_(.+)`
  ├ modals
  │ └ suggestion.ts # Will handle for modals with ID `suggestion`
  └ selects
    └ rating.ts # Will handle for selectmenu submissions with ID `rating`
```

This means that component file names must be unique within their category.

The component categories available are buttons, selects, and modals.

## Component execution

All components are required to have a default export, this function is how your
component will be handled.

```ts
// src/components/buttons/guess_:answer.ts
import type { ComponentInteraction } from "dressed";

export default async function guess(
  interaction: ComponentInteraction,
  args: { answer: string },
) {
  if (args.answer === correctAnswer) {
    await interaction.reply("Good job!");
  } else {
    await interaction.reply("Nice try!");
  }
}
```

## Dynamic Component IDs

As you may have noticed in the previous example, a component can be passed certain arguments.

Components can be **parameterized** using special patterns in their filenames. This enables you to match component IDs dynamically and extract arguments from them. Dynamic IDs can be applied to any component type.

### Pattern Syntax

If a filename contains `:<argname>`, it becomes dynamic, so it will match any component ID that fits the pattern, and extract the matching segment into a string argument passed to the component.

You can also make parts of the pattern **optional** using `{...}`. This allows components to handle multiple ID variations with a single file.

### Examples

| Filename                    | Matches                  | Extracted Args    |
| --------------------------- | ------------------------ | ----------------- |
| `print_:value.ts`           | `print_<...>`            | `{ value: ... }`  |
| `action_:action_execute.ts` | `action_<...>_execute`   | `{ action: ... }` |
| `ticket{-:state}.ts`        | `dialog`, `dialog-<...>` | `{ state?: ... }` |

```ts
// src/components/buttons/print_:value.ts
export default async function print(_, args: { value: string }) {
  console.log(args.value);
}
```

Will be invoked for IDs like `print_hello` or `print_test`.

```ts
// src/components/buttons/ticket{-:state}.ts
export default async function ticket(_, args: { state?: string }) {
  console.log("State:", args.state ?? "default");
}
```

Will handle both `ticket` (no `state` argument) and IDs like `ticket-open`.

### Learn More

This behavior is powered by [`@dressed/matcher`](https://www.npmjs.com/package/@dressed/matcher).
