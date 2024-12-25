### createMessage

Post a message to a guild text or DM channel.

#### Parameters

- `channel` (string): The ID of the channel to post the message to.
- `data` (string | RESTPostAPIChannelMessageJSONBody): The message content or data.

#### Returns

- `Promise<APIMessage>`: The created message.

```ts
const message = await createMessage("123456789012345678", "Hello, world!");
```

---

### getMessages

Retrieve the messages in a channel.

#### Parameters

- `channel` (string): The ID of the channel to get messages from.

#### Returns

- `Promise<APIMessage[]>`: An array of messages from the channel.

```ts
const messages = await getMessages("123456789012345678");
```

---

### getMessage

Retrieve a specific message in the channel.

#### Parameters

- `channel` (string): The ID of the channel to get the message from.
- `message` (string): The snowflake of the message to retrieve.

#### Returns

- `Promise<APIMessage>`: The fetched message.

```ts
const message = await getMessage("123456789012345678", "987654321098765432");
```

---

### editMessage

Edit a previously sent message.

#### Parameters

- `channel` (string): The ID of the channel to edit the message in.
- `message` (string): The snowflake of the message to edit.
- `data` (string | RESTPatchAPIChannelMessageJSONBody): The new message content or data.

#### Returns

- `Promise<APIMessage>`: The edited message.

```ts
const updatedMessage = await editMessage(
  "123456789012345678",
  "987654321098765432",
  "Updated content"
);
```

---

### deleteMessage

Delete a message. Requires the `MANAGE_MESSAGES` permission for non-user messages in guild channels.

#### Parameters

- `channel` (string): The ID of the channel to delete the message from.
- `message` (string): The snowflake of the message to delete.

#### Returns

- `Promise<void>`: Resolves when the message is deleted.

```ts
await deleteMessage("123456789012345678", "987654321098765432");
```

---

### bulkDelete

Delete multiple messages in a single request.

#### Parameters

- `channel` (string): The ID of the channel to delete messages from.
- `messages` (Snowflake[]): An array of message snowflakes to delete.

#### Returns

- `Promise<void>`: Resolves when the messages are deleted.

```ts
await bulkDelete("123456789012345678", [
  "111111111111111111",
  "222222222222222222",
]);
```

---

### createReaction

Add a reaction to a message.

#### Parameters

- `channel` (string): The ID of the channel to add the reaction in.
- `message` (string): The snowflake of the message to react to.
- `emoji` (string): The emoji to react with.

#### Returns

- `Promise<void>`: Resolves when the reaction is added.

```ts
await createReaction("123456789012345678", "987654321098765432", "👍");
```

---

### deleteReaction

Delete a reaction from a message.

#### Parameters

- `channel` (string): The ID of the channel to delete the reaction in.
- `message` (string): The snowflake of the message to delete the reaction from.
- `emoji` (string): The emoji to delete.
- `user` (string, optional): The user ID to delete the reaction for (defaults to self).

#### Returns

- `Promise<void>`: Resolves when the reaction is deleted.

```ts
await deleteReaction("123456789012345678", "987654321098765432", "👍");
```

```

```
