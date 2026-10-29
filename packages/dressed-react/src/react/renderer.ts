import { createHash } from "node:crypto";
import { type APIMessageComponent, type APIModalComponent, ComponentType } from "discord-api-types/v10";
import { TextDisplay } from "dressed";
import { parseActionRow } from "../components/action-row.ts";
import { parseButton } from "../components/button.ts";
import { parseCheckboxGroup } from "../components/checkbox.ts";
import { parseContainer } from "../components/container.ts";
import { parseLabel } from "../components/label.ts";
import { parseMediaGallery } from "../components/media-gallery.ts";
import { parseRadioGroup } from "../components/radio-group.ts";
import { parseSection } from "../components/section.ts";
import { parseSelectMenu } from "../components/select-menu.ts";
import { parseTextDisplay } from "../components/text-display.ts";
import type { Node } from "./node.ts";
import { createTextNode, type TextNode } from "./text-node.ts";

export interface Renderer {
  nodes: Node<unknown>[];
  render: () => void;
}

export type ComponentNode = Node<APIMessageComponent | APIModalComponent, APIMessageComponent | APIModalComponent>;

export function mergeTextNodes<T>(nodes: Node<T>[]): Node<T>[] {
  const merged = [];
  let content = "";

  function pushText() {
    if (content.length) {
      merged.push(createTextNode(content));
      content = "";
    }
  }

  for (const node of nodes) {
    if (typeof node.props === "string") {
      content += node.props;
    } else {
      pushText();
      merged.push({ ...node, children: mergeTextNodes(node.children) });
    }
  }

  pushText();
  return merged;
}

export type RendererCallback = (components: (APIMessageComponent | APIModalComponent)[]) => unknown;

export function createRenderer(callback: RendererCallback) {
  let prevHash = "";
  const renderer: Renderer = {
    nodes: [],
    render() {
      const components = mergeTextNodes(renderer.nodes as ComponentNode[]).map(parseNode);
      const hash = createHash("sha256").update(JSON.stringify(components)).digest("hex");
      if (hash === prevHash) return;
      prevHash = hash;
      callback?.(components);
    },
  };

  return renderer;
}

export function parseNode(node: ComponentNode | TextNode): APIMessageComponent | APIModalComponent {
  if (typeof node.props === "string") {
    return TextDisplay(node.text());
  }
  switch (node.props.type) {
    case ComponentType.ActionRow:
      return parseActionRow(node.props, node.children as never);
    case ComponentType.Button:
      return parseButton(node.id, node.props);
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return parseSelectMenu(node.id, node.props, node.children as never);
    case ComponentType.TextInput:
    case ComponentType.Thumbnail:
    case ComponentType.File:
    case ComponentType.Separator:
    case ComponentType.FileUpload:
    case ComponentType.Checkbox:
      return node.props;
    case ComponentType.Section:
      return parseSection(node.props, node.children as never);
    case ComponentType.TextDisplay:
      return parseTextDisplay(node.props, node.text());
    case ComponentType.MediaGallery:
      return parseMediaGallery(node.props, node.children as never);
    case ComponentType.Container:
      return parseContainer(node.props, node.children as never);
    case ComponentType.Label:
      return parseLabel(node.props, node.children as never);
    case ComponentType.RadioGroup:
      return parseRadioGroup(node.props, node.children as never);
    case ComponentType.CheckboxGroup:
      return parseCheckboxGroup(node.props, node.children as never);
    default: {
      throw new Error("Unknown node");
    }
  }
}
