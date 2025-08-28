// TODO
// Import label types from discord-api-types once they merge modal components
// Use ComponentType.Label instead of hardcoding 18
// Remove input check
import {
  ComponentType,
  type APISelectMenuComponent,
  type APITextInputComponent,
} from "discord-api-types/v10";

type APIComponentInLabel =
  | (APISelectMenuComponent & { required?: boolean })
  | Omit<APITextInputComponent, "label">;

interface APILabelComponent {
  id?: number;
  /** The label text */
  label: string;
  /** An optional description textfor the label */
  description?: string;
  /** The component within the label */
  component: APIComponentInLabel;
  type: 18;
}

/**
 * Creates a label component
 *
 * Container associating a label and description with a component
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
  if (component.type === ComponentType.TextInput) {
    // @ts-expect-error No labels for inputs in labels.
    delete component.label;
  }
  return {
    ...config,
    label,
    description,
    component,
    type: 18,
  };
}
