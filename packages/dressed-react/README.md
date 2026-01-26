# @dressed/react

Create messages using React, patched interaction responses require ComponentsV2 and will not accept a content field.

If you manually call the render function yourself, you can use the old components.

## 📦 Install

```sh
bun add react @dressed/react
```

## 🚀 Usage

```tsx
// src/commands/ping.tsx
import type { CommandInteraction } from "dressed";
import { patchInteraction, ActionRow, Button } from "@dressed/react";

export default async function ping(interaction: CommandInteraction) {
  const patched = patchInteraction(interaction);
  await patched.reply(
    <>
      Pong!
      <ActionRow>
        <Button custom_id="new-pong" label="Again!" />
      </ActionRow>
    </>,
    { ephemeral: true },
  );
}
```

If you don't want to manually patch every interaction, you can use middleware:

```ts title="dressed.config.ts"
import { patchInteraction } from "@dressed/react";
import type { DressedConfig } from "dressed/server";

export default {
  build: { extensions: ["tsx", "ts"] },
  middleware: {
    commands: (i) => [patchInteraction(i)],
    components: (i, a) => [patchInteraction(i), a],
  },
} satisfies DressedConfig;
```

> [!IMPORTANT]
> In order for Dressed to bundle your tsx/jsx files, the extension must be added to the build config's extensions array\
> e.g. `dressed build -E tsx,ts`
