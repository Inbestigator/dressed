import type { Node } from "./node.ts";
import {
  type APIMediaGalleryItem,
  type APIMessageComponent,
  type APIModalComponent,
  type APISelectMenuOption,
  ComponentType,
} from "discord-api-types/v10";
import { TextDisplay } from "dressed";
import { parseActionRow } from "../components/action-row.ts";
import { parseContainer } from "../components/container.ts";
import { parseTextDisplay } from "../components/text-display.ts";
import { parseSelectMenu } from "../components/select-menu.ts";
import { parseMediaGallery } from "../components/media-gallery.ts";
import { parseSection } from "../components/section.ts";

export interface Renderer {
  nodes: Node<unknown>[];
  render: () => Promise<void>;
  components: (APIMessageComponent | APIModalComponent)[];
}

export type ComponentNode = Node<
  APIMessageComponent | APIModalComponent,
  APIMessageComponent | APIModalComponent
>;

export function createRenderer(): Renderer {
  const components: (APIMessageComponent | APIModalComponent)[] = [];
  const nodes: Node<APIMessageComponent | APIModalComponent>[] = [];

  return {
    nodes,
    async render() {
      console.log(nodes);
      for (const node of nodes) {
        components.push(await renderNode(node));
      }
    },
    components,
  };
}

export async function renderNode(
  node: ComponentNode,
): Promise<APIMessageComponent | APIModalComponent> {
  switch (node.props.type) {
    case ComponentType.ActionRow: {
      return parseActionRow(node.props, node.children);
    }
    case ComponentType.Button:
    case ComponentType.TextInput:
    case ComponentType.Thumbnail:
    case ComponentType.File:
    case ComponentType.Separator: {
      return node.props;
    }
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect: {
      return parseSelectMenu(
        node.props,
        node.children as Node<APISelectMenuOption>[],
      );
    }
    case ComponentType.Section: {
      return parseSection(node.props, node.children);
    }
    case ComponentType.TextDisplay: {
      return parseTextDisplay(node.props, node.text());
    }
    case ComponentType.MediaGallery: {
      return parseMediaGallery(
        node.props,
        node.children as Node<APIMediaGalleryItem>[],
      );
    }
    case ComponentType.Container: {
      return parseContainer(node.props, node.children);
    }
    default: {
      if (typeof node.props === "string") {
        return TextDisplay(node.text());
      }

      throw new Error("Unknown node");
    }
  }
}
