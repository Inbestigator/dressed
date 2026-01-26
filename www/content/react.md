# Creating messages with React

[@dressed/react](https://www.npmjs.com/package/@dressed/react) is a library that lets you build messages and modals using React components, which are rendered into a standard JSON payload. The library supports most modern React features; however, when deploying to serverless platforms, you should avoid relying on post-render updates (such as state changes, suspenses, or effects), as the execution environment may not persist long enough to apply them.

Upgrading from using Dressed's components to React should be fairly straightforward, as the syntax for Dressed is intentionally similar looking to JSX.

## Installation

```sh caption="Let's start by installing React and the React lib"
bun add react @dressed/react
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
>   build: { extensions: ["ts", "tsx"] },
> } satisfies ServerConfig;
> ```

## Sending a message

Using JSX in your bot isn't enough to send a message through the main library. You need to use the `render` function, which takes in your components and returns the objects that Discord expects.

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

Calling the `render` function every time you want to do anything regarding a message will get tiresome, thankfully `@dressed/react` exports a custom version of `createMessage` and other similar functions. The library automatically applies the `1 << 15` flag for you.

```tsx title="dog.tsx"
import { createMessage, ... } from "@dressed/react";

const components = (...);

await createMessage("<channel_id>", components);
```

## Hooks

Your bot is (hopefully) running in a server environment, but the React runtime acts like it's in the client. So while being unable to use async components ([server components](https://react.dev/reference/rsc/server-components) only), your bot has access to all hooks, notably including [`useState`](https://react.dev/reference/react/useState), [`useEffect`](https://react.dev/reference/react/useEffect), and [`use`](https://react.dev/reference/react/use).

You can include callbacks in buttons and select menus (`onClick` and `onSubmit`, respectively) that will be triggered when the user interacts with that component. [Click here](#callback-handlers) for more information on enabling callbacks.

```tsx title="counter.tsx" showLineNumbers
import { createMessage } from "@dressed/react";
import { useState } from "react";

function Counter() {
  const [counter, setCounter] = useState(0);

  return (
    <Section accessory={<Button onClick={() => setCounter(counter + 1)} label="Add" />}>
      Current count: {counter}
    </Section>
  );
}

await createMessage("<channel_id>", <Counter />);
```

### Asynchronous loading

Asynchronous loading can be enabled by pairing Suspense and the use hook. I'd also recommend libraries like [Tanstack Query](https://tanstack.com/query/docs) for gaining more control over caching and fail states.

```tsx title="products.tsx" showLineNumbers
import { Container, createMessage, Section, Thumbnail } from "@dressed/react";
import { Suspense, use } from "react";

type Product = { id: number; title: string; description: string; thumbnail: string };

function Products({ promise }: Readonly<{ promise: Promise<{ products: Product[] }> }>) {
  const { products } = use(promise);
  return products.map((product) => (
    <Section key={product.id} accessory={<Thumbnail media={product.thumbnail} />}>
      ### {product.title}
      {"\n"}
      {product.description}
    </Section>
  ));
}

await createMessage(
  "<channel_id>",
  <Container>
    <Suspense fallback="Fetching products...">
      <Products promise={fetch("https://dummyjson.com/products?limit=3").then((r) => r.json())} />
    </Suspense>
  </Container>,
);
```

### Callback handlers

When using callbacks within your messages, you must first create a handler file for each component type you wish to use (button or select). This works as the central handler which is actually run when the interaction comes in.

```tsx title="src / components / buttons / react.ts" showLineNumbers
import { createCallbackHandler } from "@dressed/react/callbacks";

export default createCallbackHandler();

export { pattern } from "@dressed/react/callbacks";
```

The callback handler takes an object of functions which can be used as fallbacks if the original handler is lost before the user interacts (such as if your bot restarts).

```tsx title="src / components / buttons / react.ts" showLineNumbers
import type { MessageComponentInteraction } from "@dressed/react";
import { createCallbackHandler } from "@dressed/react/callbacks";

const buttonCallbackHandler = createCallbackHandler({
  // The default fallback will be called if no fallback is specified in the component
  default(i: MessageComponentInteraction) {
    return i.reply("That handler has expired", { ephemeral: true });
  },
  counter(i: MessageComponentInteraction) {
    return i.reply("This counter is no longer interactive!", { ephemeral: true });
  },
});

export { pattern } from "@dressed/react/callbacks";
export default buttonCallbackHandler;
```

You can now update your counter file to include a fallback key in your component which corresponds to the function you want. The callback handler you created includes all your fallback function names so you don't have to remember them.

```diff title="counter.tsx" caption="We import and use the handler's fallbacks. Setting the fallback key directly to 'counter' would also work."
+ import buttonCallbackHandler from "./src/components/buttons/react";

- <Section accessory={<Button onClick={() => setCounter(counter + 1)} label="Add" />}>
+ <Section accessory={<Button onClick={() => setCounter(counter + 1)} label="Add" fallback={buttonCallbackHandler.fallbacks.counter} />}>
```

## Interactions

What about replying to an interaction? That presumably still requires you to use the `render` function, right? Fear not! The React library also exports a `patchInteraction` function which will automatically change the reply methods to accept React components instead of the usual content.

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
