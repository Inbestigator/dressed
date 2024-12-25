### getGuild

Get a guild by ID.

#### Parameters

- `guild` (string): The ID of the guild to fetch.
- `with_counts` (boolean, optional): Whether to include member and presence counts in the response.

#### Returns

- `Promise<APIGuild>`: The fetched guild.

```ts
const guild = await getGuild("123456789012345678", true);
```

---

### listChannels

Get a list of channels in a guild, does not include threads.

#### Parameters

- `guild` (string): The ID of the guild to get the channels from.

#### Returns

- `Promise<APIChannel[]>`: The list of channels in the guild.

```ts
const channels = await listChannels("123456789012345678");
```

---

### getMember

Get a specific member from a guild.

#### Parameters

- `guild` (string): The ID of the guild to get the member from.
- `member` (string): The ID of the member to fetch.

#### Returns

- `Promise<APIGuildMember>`: The fetched guild member.

```ts
const member = await getMember("123456789012345678", "987654321098765432");
```

---

### listMembers

Get a list of members in a guild.

#### Parameters

- `guild` (string): The ID of the guild to get the members from.

#### Returns

- `Promise<APIGuildMember[]>`: The list of members in the guild.

```ts
const members = await listMembers("123456789012345678");
```
