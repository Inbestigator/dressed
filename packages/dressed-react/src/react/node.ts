export interface Node<Props, Children = unknown> {
  props: Props;
  children: Node<Children>[];
  text: () => string;
  hidden: boolean;
}

export function createNode<Props>(props: Props) {
  const node: Node<Props> = {
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
