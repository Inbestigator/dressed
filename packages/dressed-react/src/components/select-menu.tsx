import {
  type APISelectMenuOption,
  type APISelectMenuComponent,
  ComponentType,
} from "discord-api-types/v10";
import {
  SelectMenu as DressedComponent,
  SelectMenuOption as DressedOption,
} from "dressed";
import { createElement, type ReactNode } from "react";
import type { Node } from "../react/node.ts";

type SelectType = {
  Channel: 8;
  Mentionable: 7;
  Role: 6;
  String: 3;
  User: 5;
};

type SelectMap = {
  [Key in keyof typeof ComponentType]: Extract<
    APISelectMenuComponent,
    { type: (typeof ComponentType)[Key] }
  >;
};

type MenuProps<K extends keyof SelectType> = Omit<
  SelectMap[`${K}Select`],
  "type" | "options"
> &
  ({ children: ReactNode; type: "String" } | { type: Exclude<K, "String"> });

export function SelectMenu<K extends keyof SelectType>(props: MenuProps<K>) {
  const { children, ...rest } = props as Record<string, unknown>;
  const component = DressedComponent(rest as never);
  return createElement(
    "dressed-node",
    component as never,
    children as ReactNode,
  );
}

export function SelectMenuOption(props: APISelectMenuOption) {
  const component = DressedOption(props.label, props.value, props);
  return createElement("dressed-node", component);
}

export function parseSelectMenu<T extends APISelectMenuComponent>(
  props: T,
  children: Node<APISelectMenuOption>[],
): T {
  if (props.type === ComponentType.StringSelect) {
    props.options = children.map((c) => c.props);
  }
  return props;
}
