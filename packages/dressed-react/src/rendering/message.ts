import { type APIMessage, MessageFlags, type Snowflake } from "discord-api-types/v10";
import { createMessage as dressedCreateMessage, editMessage as dressedEditMessage } from "dressed";
import type { CallConfig } from "dressed/utils";
import type { ReactNode } from "react";
import type { OpaqueRoot } from "react-reconciler";
import { render } from "./index.ts";

export type WithContainer<T> = T & {
  /**
   * The root of this rendered component, can be used to update data or clear it in order to effectively stop the React process.
   * @example
   * import { createMessage, reconciler } from "@dressed/react";
   * const { $container } = await createMessage(channelId, "Hello");
   * reconciler.updateContainer(null, $container);
   */
  $container: OpaqueRoot;
};

/**
 * Renders the provided children and posts a message to a guild text or DM channel with the `IsComponentsV2` flag.
 * @example createMessage(channelId, <Button label="Foo" />)
 */
export function createMessage(
  channelId: Snowflake,
  components: ReactNode,
  data: Omit<Exclude<Parameters<typeof dressedCreateMessage>[1], string>, "content" | "components" | "embeds"> = {},
  $req?: CallConfig,
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

  let messageId: string | 0 | undefined;
  let pendingEdit = false;

  function edit() {
    if (!messageId) return;
    return dressedEditMessage(channelId, messageId, data, $req);
  }

  return new Promise<WithContainer<APIMessage>>((resolve) => {
    const { container } = render(components, async (c) => {
      if (c.length === 0) return;
      // @ts-expect-error
      data.components = c;
      if (messageId) return edit();
      if (messageId === 0) {
        pendingEdit = true;
        return;
      }
      messageId = 0;
      const message = await dressedCreateMessage(channelId, data, $req);
      messageId = message.id;
      if (pendingEdit) edit();
      resolve(Object.assign(message, { $container: container }));
    });
  });
}

/**
 * Renders the provided children and edits a previously sent message.
 * @example editMessage(channelId, messageId, <Button label="Bar" />)
 */
export function editMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  components: ReactNode,
  data: Omit<Exclude<Parameters<typeof dressedEditMessage>[2], string>, "content" | "components" | "embeds"> = {},
  $req?: CallConfig,
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

  return new Promise<WithContainer<APIMessage>>((resolve) => {
    const { container } = render(components, async (c) => {
      if (c.length === 0) return;
      // @ts-expect-error
      data.components = c;
      resolve(Object.assign(await dressedEditMessage(channelId, messageId, data, $req), { $container: container }));
    });
  });
}
