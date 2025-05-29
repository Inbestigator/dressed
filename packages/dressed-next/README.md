# @dressed/next

Easily handle Discord interactions/events using Dressed in your Next.js or Vercel function project.

## 📦 Install

```bash
bun add dressed @dressed/next
```

## 🚀 Usage

```ts
// app/bot/route.ts
import createHandler from "@dressed/next";
import { commands, components, events } from "@/.dressed";

export const POST = createHandler(commands, components, events);
```
