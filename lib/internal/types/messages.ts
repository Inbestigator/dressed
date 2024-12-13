import type { RESTPatchAPIWebhookWithTokenMessageJSONBody } from "discord-api-types/v10";
import type { ActionRow } from "../../core/components/actionrow.ts";

export type MessageComponents = ReturnType<typeof ActionRow>[];

export type MessageOptions =
  | RESTPatchAPIWebhookWithTokenMessageJSONBody
  | string;
