# Dressed Config

The config applies global configuration for various services, including all requests, and logging. By default, Dressed includes a [Node HTTP](https://nodejs.org/api/http.html) server system. If you create a custom system using the vital server functions, this config may still pertain to you.

Many of the options here are also parameters in the `dressed build` command from [@dressed/framework](https://npmjs.com/@dressed/framework), using them in the command will override the value in your config file.

The framework supports defining your configs as the default export in a file named `dressed.config.ts`, although other JS filetypes will work (including `.json`). This file will be used when building your project.

## Example config

```ts title="dressed.config.ts" caption="This is an example configuration file within a framework-powered project (requires @dressed/framework)"
import type { DressedConfig } from "@dressed/framework";
import { patchInteraction } from "@dressed/react";

export default {
  endpoint: "/bot",
  port: 3000,
  build: { include: ["**/*.{ts,tsx}", "!**/*.test.ts"], root: "src/bot" },
  middleware: {
    commands: (i) => [patchInteraction(i)],
    components: (i, a) => [patchInteraction(i), a],
  },
} satisfies DressedConfig;
```

```ts caption="A simple example of setting the config without the framework"
import type { DressedConfig } from "dressed/server";
import { config } from "dressed/utils";

Object.assign(config, {
  logger: "Error",
} satisfies DressedConfig);
```

## Config breakdown

### Endpoint

The endpoint to listen on, the default for this is `/`.

### Port

The port to listen on, the default for this is `8000`.

### Middleware

Middleware functions are executed right before your actual handlers. The values returned from them are used as the props passed to your handler.

If you don't want to modify the handler's props, directly return the middleware's props.

Here's an example of some middleware:

```ts
{
    // Passthroughed props
    commands(...props) {
        console.log("Middleware!")
        return props
    },
    // Modified props
    components: (interaction, args) => [patchInteraction(interaction), args]
}
```

### Requests

These values will set the default call configuration for every API request. It can still be overriden on a per-request basis by setting the $req prop.

```ts
{
  requests: {
    authorization: "Bot TOKEN",
    routeBase: "https://proxy.example.com";
  }
}
```

```ts
createMessage("CHANNEL_ID", "Hello, world", { authorization: "Bot OTHER_TOKEN" });
```

### Build

The build object is only available when using the config with the framework. The types with build included are exported from [@dressed/framework](https://npmjs.com/@dressed/framework).

#### Build root

This is the source root that the server uses when assembling files, the default is `src`.

#### Build include

Glob patterns used when bundling handlers to determine which files to include, by default it is `["**/*.{js,ts,mjs}"]`. Negation patterns can be used to exclude files, e.g. `"!**/*.test.ts"`.
