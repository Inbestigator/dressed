### createThread

Creates a new thread, optionally starting it from a specific message.

#### Parameters

- `channel` (string): The ID of the channel to create the thread in.
- `data` (Omit<RESTPostAPIChannelThreadsJSONBody, "type"> & { type?: "Public" | "Private" | number }): The thread data. Specify the type as `"Public"` or `"Private"`, or use the corresponding numerical values (11 for public, 12 for private).
- `message` (string, optional): The ID of the message to create the thread from. If provided, the thread is associated with that message.

#### Returns

- `Promise<APIThreadChannel>`: The created thread.

```ts
const thread = await createThread(
  "123456789012345678",
  { name: "New Thread" },
  "987654321098765432"
);
```

---

### createForumThread

Creates a new thread in a forum channel.

#### Parameters

- `channel` (string): The ID of the forum channel to create the thread in.
- `data` (RESTPostAPIGuildForumThreadsJSONBody): The thread data.

#### Returns

- `Promise<APIThreadChannel>`: The created thread.

```ts
const forumThread = await createForumThread("123456789012345678", {
  name: "Forum Thread",
  message: { content: "Discussion topic!" },
});
```

---

### joinThread

Adds the current user to a thread.

#### Parameters

- `thread` (string): The ID of the thread to join.

#### Returns

- `Promise<void>`: Resolves when the user joins the thread.

```ts
await joinThread("123456789012345678");
```

---

### addThreadMember

Adds another member to a thread. Requires permission to send messages in the thread.

#### Parameters

- `thread` (string): The ID of the thread.
- `user` (string): The ID of the user to add.

#### Returns

- `Promise<void>`: Resolves when the user is added to the thread.

```ts
await addThreadMember("123456789012345678", "987654321098765432");
```

---

### leaveThread

Removes the current user from a thread.

#### Parameters

- `thread` (string): The ID of the thread to leave.

#### Returns

- `Promise<void>`: Resolves when the user leaves the thread.

```ts
await leaveThread("123456789012345678");
```

---

### removeThreadMember

Removes another member from a thread. Requires the `MANAGE_THREADS` permission or ownership of a `PRIVATE_THREAD`.

#### Parameters

- `thread` (string): The ID of the thread.
- `user` (string): The ID of the user to remove.

#### Returns

- `Promise<void>`: Resolves when the user is removed from the thread.

```ts
await removeThreadMember("123456789012345678", "987654321098765432");
```
