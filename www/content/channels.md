### getChannel

Get a channel by ID.

#### Parameters

- `channel` (string): The ID of the channel to fetch.

#### Returns

- `Promise<APIChannel>`: The fetched channel.

```ts
const channel = await getChannel("123456789012345678");
```

---

### modifyChannel

Update a channel's settings.

#### Parameters

- `channel` (string): The ID of the channel to modify.
- `data` (RESTPatchAPIChannelJSONBody): The new data for the channel.

#### Returns

- `Promise<APIChannel>`: The updated channel.

```ts
const data = {
  name: "new-channel-name",
  topic: "New topic for the channel",
};

await modifyChannel("123456789012345678", data);
```

---

### deleteChannel

Delete a channel, or close a private message.

#### Parameters

- `channel` (string): The ID of the channel to delete.

#### Returns

- `Promise<APIChannel>`: The deleted channel.

```ts
await deleteChannel("123456789012345678");
```
