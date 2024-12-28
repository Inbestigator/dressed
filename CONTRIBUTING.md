# Contributing to Discord-HTTP

Thank you for considering contributing to Discord-HTTP! Below are some guidelines to help you get started.

## Naming system for helper functions

When contributing helper functions that interface with the Discord API, please follow the naming conventions outlined below to maintain consistency and readability throughout the codebase.

### General guidelines

1. **Use descriptive names**: Function names should clearly describe what the function does. Avoid using abbreviations or acronyms unless they are well-known and widely accepted.
2. **Verb-Noun structure**: Use a verb-noun structure for function names to indicate the action being performed and the entity being acted upon. For example, `createMessage`, `deleteChannel`, `getGuild`.
3. **Consistency**: Ensure that similar functions follow a consistent naming pattern. For example, if you have `getChannel`, `getGuild`, and `getUser`, use the same pattern for other similar functions like `getMessage`.

### Specific naming conventions

- **Create functions**: Functions that create a new resource should start with `create`. For example, `createMessage`, `createChannel`.
- **Get functions**: Functions that retrieve a single/determinate resource should start with `get`. For example, `getChannel`, `getGuild`.
- **Update functions**: Functions that update an existing resource should start with `update` or `modify`. For example, `updateChannel`, `modifyGuild`.
- **Delete functions**: Functions that delete a resource should start with `delete`. For example, `deleteMessage`, `deleteChannel`.
- **List functions**: Functions that retrieve a list of resources should start with `list`. For example, `listChannels`, `listGuilds`.

## Submitting Contributions

1. **Fork the repository**: Start by forking the repository to your own GitHub account.
2. **Create a branch**: Create a new branch for your feature or bug fix.
3. **Submit a pull request**: Once your changes are ready, submit a pull request to the main repository. Provide a clear description of your changes and the problem they solve.

Thank you for your contributions! If you have any questions, feel free to reach out to me (Inbestigator)
