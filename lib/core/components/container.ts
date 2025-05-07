import {
  type APIComponentInContainer,
  type APIContainerComponent,
  ComponentType,
} from "discord-api-types/v10";
import { ActionRow } from "./action-row.ts";
import { Button } from "../../mod.ts";
import { Section } from "./section.ts";
import { Separator } from "./separator.ts";

export function Container(
  components: APIComponentInContainer[],
  config: Omit<APIContainerComponent, "components" | "type">,
): APIContainerComponent;

export function Container(
  ...components: APIComponentInContainer[]
): APIContainerComponent;

/**
 * Creates a container component
 *
 * Provide a list of components to put in the container
 */
export function Container(
  ...args: [
    APIComponentInContainer[],
    Omit<APIContainerComponent, "components" | "type">,
  ] | APIComponentInContainer[]
): APIContainerComponent {
  if (Array.isArray(args[0]) && args.length === 2) {
    const [components, config] = args as [
      APIComponentInContainer[],
      Omit<APIContainerComponent, "components" | "type">,
    ];
    return {
      ...config,
      components,
      type: ComponentType.Container,
    };
  } else {
    const components = args as APIComponentInContainer[];
    return {
      components,
      type: ComponentType.Container,
    };
  }
}

console.log(
  Container(
    [ActionRow(Button({ custom_id: "test", label: "test" }))],
    { id: 23, accent_color: 0xff0000 },
  ),
);

console.log(
  Container(
    ActionRow(Button({ custom_id: "test", label: "test" })),
    ActionRow(Button({ custom_id: "test", label: "test" })),
    Section(["a", "b,c"], Button({ custom_id: "test", label: "test" })),
    Separator(),
  ),
);
