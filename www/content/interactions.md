# Interactions

All interaction types share a set of core response methods. Additional methods are available for specific interaction types.

## Base methods

These methods are available on most interactions:

### Reply

Sends an immediate response to the interaction.

**Parameters**

- `data`: The message content or options.

```ts
await interaction.reply({ content: "Hello!", ephemeral: true });
```

### Defer Reply

Acknowledges the interaction, showing a "thinking..." indicator to the user, with an option to edit or respond later.

**Parameters**

- `data` (optional): Options for deferral, such as whether it's ephemeral:

```ts
await interaction.deferReply({ ephemeral: true });
```

### Edit Reply

Edits the initial response to the interaction.

**Parameters**

- `data`: The updated message content or options.

```ts
await interaction.editReply("Updated message content");
```

### Follow Up

Sends an additional message related to the interaction.

**Parameters**

- `data`: The follow-up message content or options.

```ts
await interaction.followUp({
  content: "Another message!",
  ephemeral: true,
});
```

### Show Modal

Responds with a modal dialog. This is not available on modal submission interactions.

**Parameters**

- `data`: Modal data, including components and title.

```ts
await interaction.showModal({
  title: "Example Modal",
  custom_id: "modal_id",
  components: [...],
});
```

---

## Command interactions

### options

The options filled in by the user, you can make this typed by adding it to the generic in `CommandInteraction`.

```ts
// export const config = {
//   options: [CommandOption({ name: "user", description: "The user", type: "User" })],
// } satisfies CommandConfig;
//
const user = interaction.options.user;
//           ^? const interaction: CommandInteraction<typeof config>
```

---

## Command autocomplete interactions

### options

The options filled in by the user, you can make this typed by adding it to the generic in `CommandAutocompleteInteraction`.

All options are treated as optional, as the user may be filling them out in any order.

```ts
// export const config = {
//   options: [CommandOption({ name: "user", description: "The user", type: "User" })],
// } satisfies CommandConfig;

const user = interaction.options.user;
//           ^? const interaction: CommandAutocompleteInteraction<typeof config>
```

### sendChoices

Provides a list of choices for the user to prompt the user to select from.

**Parameters**

- `choices`: The choices to suggest.

```ts
interaction.sendChoices([
  { name: "Dog", value: "dog" },
  { name: "Cat", value: "cat" },
]);
```

---

## Message component interactions

### values

For selectmenus this is will be an array of the resolved values submitted by the user. You can choose what type it'll be by specifying the generic in `MessageComponentInteraction`.

```ts
const users = interaction.values;
//            ^? const interaction: MessageComponentInteraction<"UserSelect">
```

### update

Edits the original message containing the component.

**Parameters**

- `data`: New content or message options.

```ts
await interaction.update("Updated content");
```

---

## Modal submit interactions

### getField

Retrieves a field from the modal submission, provides functions to retrieve the value.

**Parameters**

- `name`: Name of the field.
- `required`: If true, throws an error if the field is not present.

```ts
const selectedLibraries = interaction.getField("library", true).stringSelect();
```
