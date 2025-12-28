import { type APIMessageTopLevelComponent, MessageFlags, type Snowflake } from "discord-api-types/v10";
import { createMessage as dressedCreateMessage, editMessage as dressedEditMessage } from "dressed";
import type { ReactNode } from "react";
import { render } from "./index.ts";

/**
 * Renders the provided children and posts a message to a guild text or DM channel with the `IsComponentsV2` flag.
 * @example createMessage(channelId, <Button label="Foo" />)
 */
export async function createMessage(
  channelId: Snowflake,
  components: ReactNode,
  data: Exclude<Parameters<typeof dressedCreateMessage>[1], string> = {},
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

  let messageId: string;

  return new Promise((resolve) => {
    render(components, async (c) => {
      data.components = c as APIMessageTopLevelComponent[];
      if (messageId) {
        return dressedEditMessage(channelId, messageId, data);
      }
      const message = await dressedCreateMessage(channelId, data);
      messageId = message.id;
      resolve(message);
    });
  });
}

/**
 * Renders the provided children and edits a previously sent message.
 * @example editMessage(channelId, messageId, <Button label="Bar" />)
 */
export async function editMessage(
  channelId: Snowflake,
  messageId: Snowflake,
  components: ReactNode,
  data: Exclude<Parameters<typeof dressedEditMessage>[2], string> = {},
) {
  data.flags = (data.flags ?? 0) | MessageFlags.IsComponentsV2;

  return new Promise((resolve) => {
    render(components, async (c) => {
      data.components = c as APIMessageTopLevelComponent[];
      resolve(dressedEditMessage(channelId, messageId, data));
    });
  });
}
