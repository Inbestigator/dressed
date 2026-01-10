import { handlers } from "../rendering/callbacks.ts";

export interface Node<Props, Children = unknown> {
  id: string;
  props: Props;
  children: Node<Children>[];
  text: () => string;
  hidden: boolean;
}

export function createNode<Props>(props: Props) {
  const node: Node<Props> = {
    id: crypto.randomUUID().slice(0, 18).replace(/-/g, ""),
    hidden: false,
    props,
    children: [],
    text() {
      if (node.hidden) return "";
      return node.children.map((c) => c.text()).join("");
    },
  };

  return node;
}

export function isNode(obj: unknown): obj is Node<unknown> {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "props" in obj &&
    "children" in obj &&
    "text" in obj &&
    typeof obj.text === "function"
  );
}

function destroyCallbacks(item: Node<unknown>) {
  if (handlers.has(item.id)) {
    clearTimeout(handlers.get(item.id)?.$handlerCleaner);
    handlers.delete(item.id);
  }
  item.children.forEach(destroyCallbacks);
}

export function removeChild<T extends Node<unknown>>(array: T[], item: T) {
  destroyCallbacks(item);
  const index = array.indexOf(item);
  if (index !== -1) {
    array.splice(index, 1);
  }
}
