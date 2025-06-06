# @dressed/matcher

A tiny utility for creating [regexes](https://en.wikipedia.org/wiki/Regular_expression) using expressive, customizable patterns.

## 🧩 Pattern Syntax

| Syntax       | Description                      |
| ------------ | -------------------------------- |
| `:<argname>` | Defines a named argument         |
| `{...}`      | Marks content inside as optional |
| `(...)`      | Content inside is a custom regex |
| And more!    | Easily plug in your own tokens   |

You can pair arguments with custom regexes to make sure the argument value matches the regex.

<details>
<summary>Sample paired regex</summary>

Input: `i-love-:animal(dogs|cats)`\
Output: `/^i-love-(?\<animal>(?:dogs|cats))$/`\
Will match:

- `i-love-dogs`
- `i-love-cats`

</details>

### Examples:

1. `button-:variant` matches `button-primary`, `button-secondary`, etc.
2. `wait{-:length}` matches `wait`, `wait-100`, `wait-200`, etc.
   - For better verboseness, you could use `wait{-:length(\d)}`
3. `ticket-(open|close)` matches `ticket-open`, `ticket-close`
4. `ticket-action:(open|close)` is the same as 3, except the action is captured

## 🧮 `scorePattern()`

Score the pattern based on how dynamic it is (higher is less dynamic)

```ts
"my-button"; // Granular
"my-:component"; // Less specific
":name"; // Open-ended
```

## 🔮 `PatternParams<pattern>`

Generates the type that a regex returned options would be.

The returned type is not completely exhaustive, but it provides a pretty good representation.

```ts
PatternParams<"i love :animal(dogs|cats)">; // { animal: "dogs" | "cats" }
```
