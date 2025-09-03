import {
  ComponentType,
  type APILabelComponent,
  type APIComponentInLabel,
} from "discord-api-types/v10";

/**
 * Creates a label component
 *
 * Container associating a label and description with a component
 * @param label The label text; max 45 characters
 * @param component The component within the label
 * @param description An optional description text for the label; max 100 characters
 */
export function Label(
  label: string,
  component: APIComponentInLabel,
  description?: string,
  config?: Omit<
    APILabelComponent,
    "label" | "component" | "description" | "type"
  >,
): APILabelComponent {
  return {
    ...config,
    label,
    description,
    component,
    type: ComponentType.Label,
  };
}
