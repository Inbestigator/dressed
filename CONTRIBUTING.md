# Contributing to Dressed

Thank you for considering contributing to Dressed! Below are some guidelines to help you get started.

This is a functionally programmed library, so classes and other object-oriented patterns should generally be avoided.

## Naming Conventions

Most functions and variables should use **camelCase**. However, when a function creates a component (most commonly message components), use **PascalCase** instead.

Functions should be defined using the `function` keyword rather than arrow functions, unless when used within a callback or as a one-liner.

```ts
function returnButton() {
  return MyButton();
}

function MyButton() {
  // Component logic
}
```

## Submitting Contributions

1. **Fork the repository**: Start by forking the repository to your own GitHub account.
2. **Create a branch**: Create a new branch for your feature or bug fix.
3. **Submit a pull request**: Once your changes are ready, submit a pull request to the main repository.
   - Provide a clear description of your changes and the problem they solve.
   - Commit messages must follow the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/).

---

Thank you for your contributions! If you have any questions, feel free to reach out to me (Inbestigator).
