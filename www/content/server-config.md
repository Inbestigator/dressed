# Server Config

By default, Dressed uses an opinionated server system that includes file layout and bundling. While the opinionated part has been separated from the vital server functionality, if you create a custom system using those functions, this config may still pertain to you.

Many of the options here are also parameters in the `dressed build` function, using them in the command will override the value in your config file.

The config file is named `dressed.config.ts`, although other JS filetypes will work (including `.json`).

## Example config

```ts
// dressed.config.ts
import { patchInteraction } from "@dressed/react";
import type { ServerConfig } from "dressed/server";

const config: ServerConfig = {
  endpoint: "/bot",
  port: 3000,
  build: { extensions: ["tsx", "ts"], root: "src/bot" },
  middleware: {
    commands: (i) => [patchInteraction(i)],
    components: (i, a) => [patchInteraction(i), a],
  },
};

export default config;
```

## Config breakdown

### Endpoint

The endpoint to listen on, the default for this is `/`.

### Port

The port to listen on, the default for this is `8000`.

### Build root

This is the source root that the server uses when assembling files, the default is `src`.

### Build extensions

The file extensions are used when bundling handlers and determine which files to include, by default it is `["js", "ts", "mjs"]`.

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
