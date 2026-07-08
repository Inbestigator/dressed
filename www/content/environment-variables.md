# Environment Variables

Dressed uses three [environment variables](https://nodejs.org/api/environment_variables.html) across various services:

- `DISCORD_TOKEN` is used to authorize requests to the Discord API.
- `DISCORD_APP_ID` is required for certain API routes.
- `DISCORD_PUBLIC_KEY` is used to verify incoming requests and ensure they originate from Discord.

Dressed provides a wrapper around `process.env` for managing these values. You can access it with:

```ts
import { botEnv } from "dressed/utils";

const token = botEnv.DISCORD_TOKEN;
```

When resolving environment variables, Dressed will prefer values defined in request configs (`config.requests.env`/`$req.env`) over those in `process.env`.

Missing variables are not validated until they are accessed. However, `@dressed/framework` will attempt to fetch the application ID and public key from Discord and write them to `.env` if `DISCORD_TOKEN` is present and either `DISCORD_APP_ID` or `DISCORD_PUBLIC_KEY` is missing.

Environment variables can be configured in several ways:

```ts
process.env.DISCORD_TOKEN = "<NEW_TOKEN>";
```

```ts
botEnv.DISCORD_TOKEN = "<NEW_TOKEN>";
```

```ts
import { config } from "dressed/utils";

Object.assign(config, { requests: { env: { DISCORD_TOKEN: "<NEW_TOKEN>" } } });
```

```ts title="dressed.config.ts"
export default {
  requests: {
    env: { DISCORD_TOKEN: "<NEW_TOKEN>" },
  },
};
```

```ts
getApp({ env: { DISCORD_TOKEN: "<NEW_TOKEN>" } });
```

The `$req` prop, available as the last parameter of every resource function, can be used to override environment variables for an individual request. Values provided through `$req.env` take precedence over all other sources.

## Loading Variables

Environment variables can be set directly when running your application:

```sh
DISCORD_TOKEN=<TOKEN> bun index.ts
```

Many modern runtimes automatically load variables from a `.env` file:

```sh title=".env"
DISCORD_TOKEN="<TOKEN>"
```

Node.js can also load `.env` files, but requires an additional [CLI option](https://nodejs.org/api/cli.html#--env-filefile):

```sh
node --env-file=.env index.js
pnpx tsx --env-file=.env index.ts
```

When deploying your bot, most services provide an option for specifying environment variables. See the [deployment guides](/docs/guide/deploying) for more information about specific providers.
