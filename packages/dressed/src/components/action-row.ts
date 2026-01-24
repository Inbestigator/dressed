import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIComponentInActionRow,
  ComponentType,
} from "discord-api-types/v10";
import { Button } from "./button.ts";
import { SelectMenu } from "./select-menu.ts";

/**
 * A top-level layout component.
 * @param components Up to 5 contextually grouped {@link Button}s *or* a single {@link SelectMenu} component
 * @example
 * ActionRow(
 *   Button({ custom_id: "click_yes", label: "Accept" }),
 *   Button({ url: "http://watchanimeattheoffice.com", label: "Learn More" }),
 *   Button({ custom_id: "click_no", label: "Decline", style: "Danger" }),
 * )
 * @see https://discord.com/developers/docs/components/reference#action-row
 */
export function ActionRow<T extends APIComponentInActionRow>(
  ...components: (T extends APIButtonComponent ? APIButtonComponent : T)[]
): APIActionRowComponent<T extends APIButtonComponent ? APIButtonComponent : T> {
  return { components, type: ComponentType.ActionRow };
}
