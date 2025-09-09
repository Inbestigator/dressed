# Events

**Be advised that currently the events that Discord sends over webhooks are very limited.**

The event are determined by their file name, here's a typical event
structure:

```sh
src
└ events
  ├ ApplicationAuthorized.ts # Triggered when your app was added to a server/user
  └ EntitlementCreate.ts # Triggered when an entitlement was created
```

This means that command file names must be globally unique. Yes, currently casing matters.

## Event execution

All events are required to have a default export, this function is how the event will be handled.

```ts title="src / events / ApplicationAuthorized.ts" showLineNumbers
import type { Event } from "dressed";

export default async function (event: Event<"ApplicationAuthorized">) {
  console.log(
    event.user.username,
    "just added me to",
    event.guild ? event.guild.name : "themself",
  );
}
```

Events are not responsive, so there aren’t dedicated functions for sending replies, like there are for interactions.
