# Creating messages with React

[@dressed/react](https://www.npmjs.com/package/@dressed/react) is a library that lets you create messages and modal using components which get rendered into the standard JSON format.

Upgrading from using Dressed's components to React should be fairly straightforward, as the syntax for Dressed is intentionally similar looking to JSX.

## Installation

```sh caption="Let's start by installing React and the React lib"
bun add dressed react @dressed/react
```

## Usage

Here's how a typical ComponentsV2 message may look in Dressed:

```ts title="dog.ts" showLineNumbers
import { ... } from "dressed";

const components = [
  Container(
    Section(
      ["## This dog is cute!"],
      Button({
        label: "I agree!",
        custom_id: "cute-click",
      })
    ),
    MediaGallery(MediaGalleryItem("https://placedog.net/256")),
    Separator(),
    TextDisplay("-# I think dogs are cute!")
  ),
];
```

Versus using `@dressed/react`:

```tsx title="dog.tsx" showLineNumbers
import { ... } from "@dressed/react";

const components = (
  <Container>
    <Section accessory={<Button label="I agree!" custom_id="cute-click" />}>
      ## This dog is cute!
    </Section>
    <MediaGallery>
      <MediaGalleryItem media="https://placedog.net/256" />
    </MediaGallery>
    <Separator />
    -# I think dogs are cute!
  </Container>
);
```

> [!TIP]
> By default, the `dressed build` command doesn't recognize `tsx` files, so you have to add the extension either in the cli arguments (`dressed build -E ts,tsx`) or your config file.
>
> ```ts title="dressed.config.ts"
> import { patchInteraction } from "@dressed/react";
> import { ServerConfig } from "dressed/server";
>
> export default {
>   build: { extensions: ["tsx", "tsx"] },
> } satisfies ServerConfig;
> ```

## Sending a message

But just using some JSX isn't enough to send a message through the main library. You need to use the `render` function, which takes in some JSX components and returns the objects that Discord expects.

```tsx title="dog.tsx"
import { render, ... } from "@dressed/react";
import { createMessage } from "dressed";

const components = (...);

await createMessage("<channel_id>", {
  // @ts-expect-error The renderer outputs any type of component, but messages expect only a subset of them
  components: (await render(components)).components,
  flags: 1 << 15, // This tells Discord you're using only components and no content
});
```

But using the `render` function every time you want to do anything regarding a message will get tiresome, thankfully `@dressed/react` exports a custom version of the `createMessage` function. The library automatically applies the `1 << 15` flag for you.

```tsx title="dog.tsx"
import { createMessage, ... } from "@dressed/react";

const components = (...);

await createMessage("<channel_id>", components);
```

## Interactions

What about replying to an interaction? That presumably still requires you to use the `render` function, right? Fear not! The React library also exports a function named `patchInteraction` which will automatically change the reply functions to accept React components instead of the usual content.

```tsx title="ping.tsx"
import { Button, patchInteraction } from "@dressed/react";
import { CommandInteraction } from "dressed";

export default async function pingCommand(interaction: CommandInteraction) {
  const patched = patchInteraction(interaction);
  await patched.reply(<Button label="Pong!" custom_id="pong" emoji={{ name: "🏓" }} />);
}
```

### Middleware

If you don't want to bother manually patching the interaction every time, then you can add it to your commands/components middleware.

```ts title="dressed.config.ts"
import { patchInteraction } from "@dressed/react";
import { ServerConfig } from "dressed/server";

export default {
  middleware: {
    commands: (i) => [patchInteraction(i)],
    components: (i, a) => [patchInteraction(i), a],
  },
} satisfies ServerConfig;
```
