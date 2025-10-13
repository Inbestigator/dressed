# Components

The component IDs are determined by their file name, here's a typical component
structure:

```sh
src
└ components
  ├ buttons
  │ ├ increase.ts # Will handle for buttons with ID `increase`
  │ └ trivia_guess_:answer.ts # Will handle for buttons with IDs like `trivia_guess_Jurassic Park`
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

```ts title="src / components / buttons / guess_:answer.ts" showLineNumbers
import type { ComponentInteraction } from "dressed";

export default function guess(interaction: ComponentInteraction, args: { answer: string }) {
  if (args.answer === correctAnswer) {
    interaction.reply("Good job!");
  } else {
    interaction.reply("Nice try!");
  }
}
```

## Dynamic Component IDs

> [!IMPORTANT]
> If you are on Windows you will encounter issues with dynamic component IDs in file names. It is recommended to export a [pattern variable](#pattern-export) instead.

As you may have noticed in the previous example, a component can be passed certain arguments.

Components can be **parameterized** using special patterns in their filenames. This enables you to match component IDs dynamically and extract arguments from them. Dynamic IDs can be applied to any component type.

### Pattern Syntax

If a filename contains `:<argname>`, it becomes dynamic, so it will match any component ID that fits the pattern, and extract the matching segment into a string argument passed to the component.

You can also make parts of the pattern **optional** using `{...}`. This allows components to handle multiple ID variations with a single file.

If you'd like to add some regex syntax, you can simply do `(...)`. This can be paired with an argument to ensure the argument value is correct.

### Pattern Export

If you have a complex dynamic ID or you're on Windows you may opt to use the `pattern` export over file name. Using pattern export will override file name completely.

#### Before

```ts title="trivia_guess_:answer.ts"

```

#### After

```ts title="trivia_guess.ts"
export const pattern = "trivia_guess_:answer"; // Matches `trivia_guess_(.+?)` no matter the filename
```

### Examples

| Filename                        | Matches                      | Arg types                            |
| ------------------------------- | ---------------------------- | ------------------------------------ |
| `print-:value.ts`               | `print-<...>`                | `{ value: string }`                  |
| `ticket{-:state}.ts`            | `dialog`, `dialog-<...>`     | `{ state?: string }`                 |
| `wait-:length(\d+).ts`          | `wait-<[0-9]+>`              | `{ length: string (string number) }` |
| `i-love-:animal(dogs\|cats).ts` | `i-love-dogs`, `i-love-cats` | `{ animal: "dogs" \| "cats" }`       |

```ts title="src / components / buttons / print-:value.ts"
export default async function print(_, args: { value: string }) {
  console.log(args.value);
}
```

Will be invoked for IDs like `print-Hello world` or `print-wowie`.

```ts title="src / components / buttons / ticket{-:action(open|close)}.ts"
export default function ticket(_, args: { action?: "open" | "close" }) {
  console.log("Action:", args.action ?? "none");
}
```

Will handle either `ticket` (no `action` argument) or `ticket-open`/`ticket-close`.

### Learn More

This behavior is powered by [@dressed/matcher](https://www.npmjs.com/package/@dressed/matcher).
