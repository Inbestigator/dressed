import { type APIMessage, MessageFlags, type Snowflake } from "discord-api-types/v10";
import { createMessage as dressedCreateMessage, editMessage as dressedEditMessage } from "dressed";
import type { CallConfig } from "dressed/utils";
import type { ReactNode } from "react";
import { render } from "./index.ts";

/**
 * Renders the provided children and posts a message to a guild text or DM channel with the `IsComponentsV2` flag.
 * @example createMessage(channelId, <Button label="Foo" />)
 */
export function createMessage(
  channelId: Snowflake,
  components: ReactNode,
  data: Omit<Exclude<Parameters<typeof dressedCreateMessage>[1], string>, "content" | "components"> = {},
  $req?: CallConfig,
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

  let messageId: string;

  return new Promise<APIMessage>((resolve) => {
    render(components, async (c) => {
      // @ts-expect-error
      data.components = c;
      if (messageId) {
        return dressedEditMessage(channelId, messageId, data, $req);
      }
      const message = await dressedCreateMessage(channelId, data, $req);
      messageId = message.id;
      resolve(message);
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
  data: Omit<Exclude<Parameters<typeof dressedEditMessage>[2], string>, "content" | "components"> = {},
  $req?: CallConfig,
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

  return new Promise<APIMessage>((resolve) => {
    render(components, async (c) => {
      // @ts-expect-error
      data.components = c;
      resolve(dressedEditMessage(channelId, messageId, data, $req));
    });
  });
}
