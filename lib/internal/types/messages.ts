import type {
  RESTAPIAttachment,
  RESTPatchAPIWebhookWithTokenMessageJSONBody,
} from "discord-api-types/v10";
import type { ActionRow } from "../../core/components/actionrow.ts";

export type MessageComponents = ReturnType<typeof ActionRow>[];

interface ExtendedMessageBody
  extends RESTPatchAPIWebhookWithTokenMessageJSONBody {
  attachments?: (RESTAPIAttachment & {
    data?: Blob;
  })[];
}

export type MessageOptions = ExtendedMessageBody | string;
