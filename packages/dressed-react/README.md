# @dressed/react

Create messages using React, patched interaction responses require ComponentsV2 and will not accept a content field.

If you manually call the render function yourself, you can use the old components.

## 📦 Install

```bash
bun add dressed react @dressed/react
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

> [!IMPORTANT]
> In order for Dressed to bundle your tsx/jsx files, the extension must be added to the build config's extensions array\
> e.g. `dressed build -E tsx,ts`
