export interface Node<Props, Children = unknown> {
  props: Props;
  children: Node<Children>[];
  text: () => string;
}

export function createNode<Props>(props: Props): Node<Props> {
  const children: Node<unknown>[] = [];

  function text(): string {
    return children.map((c) => c.text()).join("");
  }

  return {
    props,
    children,
    text,
  };
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
