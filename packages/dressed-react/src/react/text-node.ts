import { createNode, type Node } from "./node.ts";

export type TextNode = Node<string>;

export function createTextNode(props: string) {
  const node = createNode<string>(props);

  node.text = () => {
    if (node.hidden) return "";
    return node.props;
  };

  return node;
}
