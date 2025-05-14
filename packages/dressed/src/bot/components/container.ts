import {
  type APIComponentInContainer,
  type APIContainerComponent,
  ComponentType,
} from "discord-api-types/v10";

/**
 * Creates a container component
 *
 * Container that visually groups a set of components
 *
 * @param componenets - Up to 10 components of the type action row, text display, section, media gallery, separator, or file
 *
 * **IMPORTANT**:
 * In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message
 */
export function Container(
  ...components: APIComponentInContainer[]
): APIContainerComponent;

export function Container(
  components: APIComponentInContainer[],
  config: Omit<APIContainerComponent, "components" | "type">,
): APIContainerComponent;

export function Container(
  ...args:
    | [
        APIComponentInContainer[],
        Omit<APIContainerComponent, "components" | "type">,
      ]
    | APIComponentInContainer[]
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
