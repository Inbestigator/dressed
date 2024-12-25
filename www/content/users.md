### getUser

Fetches a user object from Discord's API based on the provided user ID.

#### Parameters

- `id` (string): The ID of the user to retrieve.

#### Returns

- `Promise<APIUser>`: Resolves to an `APIUser` object containing the user's data.

```ts
const user = await getUser("123456789012345678");
```
