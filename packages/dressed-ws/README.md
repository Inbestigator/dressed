# @dressed/ws

Interact with the Discord gateway. Handles connecting, disconnecting, sharding.

## 📦 Install

```bash
bun add dressed @dressed/ws
```

## 🚀 Usage

### Connecting

```ts
import { createConnection } from "@dressed/ws";

const connection = createConnection({ intents: ["DirectMessages"] });
connection.onReady((data) => console.log(data.user.username, "is ready"), {
  once: true,
});
```

Like Dressed core, it will use the `DISCORD_TOKEN` environment variable for the token by default.

The connection will automatically check if it should reshard. The interval and threshold are customizable within the shards option in `createConnection`.

> [!TIP]
> If you want to disable the auto-resharding system, set `shards.reshardInterval` to `-1`.
>
> To manually reshard, you can use `connection.shards.reshard(n)`.

### Caching

Dressed will cache responses from the functions you provide in the first `createCache` prop.

The cache provides an object (`getters`) of all API interfacing functions you'd likely want to cache.

```ts
import { createCache, getters } from "@dressed/ws/cache";

const myCache = createCache({
  ...getters,
  async findUser(id: string) {
    const res = await fetch(`https://example.com/api/user?id=${id}`);
    return res.json();
  },
});
const app = await cache.getApp();
const user = await myCache.findUser("123");
```

<details>

<summary>
To customize the behaviour of your cache, it's as easy as providing functions in the logic option.
</summary>

The `get` function must return an object with a state. The state can be `hit`, `stale`, or `miss`.

- A `hit` or `stale` state must also include a `value` which will be returned.
- If the state is `stale`, the cache value will be refetched in the background.
- For a `miss`, the cache value will be fetched and the function will wait for it to finish.

Checkout [this example](https://github.com/Inbestigator/dressed/blob/53cea0eaa3a8643dc7c58bee9acfae720e13bc68/packages/dressed-ws/src/example.ts#L25-L43) to see some custom logic using Redis.

The default logic has some timing config which can be updated by using the `defaultLogic` function in the logic option.

</details>

<details>

<summary>You can use the <code>desiredProps</code> option to only save certain keys in the cache.</summary>

Doing this will cause the returned type to be turned into a partial where only the props in your array are excluded.

The reason that all others aren't omitted completely is because a miss will return the whole data from the response.

```ts
import { createCache, getters } from "@dressed/ws/cache";

const cache = createCache(getters, { desiredProps: { getUser: ["username"] } });
const user = await cache.getUser("123456789012345678");
user.username; // string
user.id; // string | undefined (normally this would be a string)
```

</details>
