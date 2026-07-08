# What's with all the functions?

Dressed is fairly unique in that it favors functional APIs over the object-oriented approach used by most Discord libraries.

One advantage of this design is that every Discord API route can be called directly through its own function. Rather than navigating through a chain of objects to access a specific endpoint, you can simply call the function you need.

This also makes it easy to create small, focused scripts that perform a single action:

```ts
import { createMessage } from "dressed";

createMessage("<CHANNEL_ID>", "Hello from Dressed!");
```

There's no need to instantiate a client, just import the route you need and call it. This keeps the API surface straightforward, improves tree-shaking, and makes individual operations easier to discover, import, and use.

Every request function accepts a final `$req` parameter containing request-specific configuration options. These options are documented [here](/dressed-config#requests) and can be used to customize how individual requests are handled.

## Naming

Functions follow a predictable naming convention based on the underlying HTTP request, making them easy to memorize:

- `create` for `POST` requests that create resources (e.g. `createMessage`)
- `add` for `PUT` requests that add or replace resources (e.g. `addThreadMember`)
- `modify` for `PATCH` requests that update existing resources (e.g. `modifyRole`)
- `delete` for `DELETE` requests (e.g. `deleteInvite`)

Some functions, such as `editMessage`, intentionally deviate from this convention for ease of use and familiarity. Under the naming system above, it would technically be named `modifyMessage`.
