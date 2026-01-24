import { type APIComponentInContainer, type APIContainerComponent, ComponentType } from "discord-api-types/v10";

/**
 * Container that visually groups a set of components.
 * Containers offer the ability to visually encapsulate a collection of components and have an optional customizable accent color bar.
 * @param components Child components that are encapsulated within the Container
 * @important In order to use this component, you must add the `MessageFlags.IsComponentsV2` flag to your message.
 * @example
 * Container(TextDisplay("I'm contained!"), File("attachment://Archive.zip"))
 * @example
 * Container(
 *   [
 *     TextDisplay("# You have encountered a wild coyote!"),
 *     MediaGallery(MediaGalleryItem("https://websitewithopensourceimages/coyote.webp")),
 *     TextDisplay("What would you like to do?"),
 *     ActionRow(
 *       Button({ custom_id: "pet_coyote", label: "Pet it!" }),
 *       Button({ custom_id: "feed_coyote", label: "Attempt to feed it", style: "Secondary" }),
 *       Button({ custom_id: "run_away", label: "Run away!", style: "Danger" }),
 *     ),
 *   ],
 *   { accent_color: 0x0abbff },
 * )
 * @see https://discord.com/developers/docs/components/reference#container
 */
export function Container(...components: APIComponentInContainer[]): APIContainerComponent;

export function Container(
  components: APIComponentInContainer[],
  config: Omit<APIContainerComponent, "components" | "type">,
): APIContainerComponent;

export function Container(
  ...args: [APIComponentInContainer[], Omit<APIContainerComponent, "components" | "type">] | APIComponentInContainer[]
): APIContainerComponent {
  if (Array.isArray(args[0]) && args.length === 2) {
    const [components, config] = args as [
      APIComponentInContainer[],
      Omit<APIContainerComponent, "components" | "type">,
    ];
    return { ...config, components, type: ComponentType.Container };
  } else {
    const components = args as APIComponentInContainer[];
    return { components, type: ComponentType.Container };
  }
}
