# @dressed/matcher

A tiny utility for creating [regexes](https://en.wikipedia.org/wiki/Regular_expression) using expressive, customizable patterns.

## 🧩 Pattern Syntax

| Syntax     | Description                      |
| ---------- | -------------------------------- |
| `:argname` | Defines a named argument         |
| `{...}`    | Marks content inside as optional |
| And more!  | Easily plug in your own tokens   |

### Examples:

1. `button-:variant` matches `button-primary`, `button-secondary`, etc.
2. `dialog{-:state}` matches `dialog`, `dialog-open`, `dialog-closed`, etc.

## 🧮 `matchOptimal()`

One string may match multiple patterns, `matchOptimal()` selects the **least dynamic** (most specific) pattern:

```
my-button     // Granular
my-:component // Less specific
:name         // Open-ended
```
