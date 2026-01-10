import { type APISelectMenuComponent, type APISelectMenuOption, ComponentType } from "discord-api-types/v10";
import { SelectMenu as DressedComponent, SelectMenuOption as DressedOption } from "dressed";
import { createElement, type ReactElement, type ReactNode, useMemo } from "react";
import type { Node } from "../react/node.ts";
import { randId, registerHandler } from "../rendering/callbacks.ts";
import type { MessageComponentInteraction } from "../rendering/interaction.ts";

type SelectType = "Channel" | "Mentionable" | "Role" | "String" | "User";

type SelectMap = {
  [Key in keyof typeof ComponentType]: Extract<APISelectMenuComponent, { type: (typeof ComponentType)[Key] }>;
};

type SelectMenuWithCustomId<K extends SelectType> = Omit<SelectMap[`${K}Select`], "type" | "options"> & {
  type: K;
} & (K extends "String" ? { children: ReactNode } : object);

type SelectMenuWithOnClick<K extends SelectType> = Omit<SelectMenuWithCustomId<K>, "custom_id"> & {
  /**
   * Create a temporary handler callback, will not work in a serverless environment
   * @warn Callbacks are deleted after 30 minutes. If you wish to have a more permanent handler, it's strongly recommended to use the [traditional component system](https://dressed.js.org/docs/components).
   */
  onSubmit: (interaction: MessageComponentInteraction<`${K}Select`>) => void;
  /** An additional handler identity defined in the callback setup which will run if the `onSubmit` is no longer registered */
  fallback?: string;
};

export function SelectMenu<K extends SelectType>(
  props: SelectMenuWithCustomId<K> & { type: K },
): ReactElement<SelectMap[`${K}Select`]>;
export function SelectMenu<K extends SelectType>(
  props: SelectMenuWithOnClick<K> & { type: K },
): ReactElement<SelectMap[`${K}Select`]>;

export function SelectMenu<K extends SelectType>(
  props: SelectMenuWithCustomId<K> | SelectMenuWithOnClick<K>,
): ReactElement<SelectMap[`${K}Select`]> {
  const { children, ...rest } = props as Record<string, unknown>;
  const handlerId = useMemo(randId, []);
  const component = DressedComponent({
    ...rest,
    ...("onSubmit" in props ? registerHandler(props.onSubmit as never, props.fallback, handlerId) : undefined),
  } as never);
  return createElement("dressed-node", component as never, children as ReactNode);
}

export function SelectMenuOption(props: APISelectMenuOption): ReactElement<APISelectMenuOption> {
  const component = DressedOption(props.label, props.value, props);
  return createElement("dressed-node", component);
}

export function parseSelectMenu<T extends APISelectMenuComponent>(props: T, children: Node<APISelectMenuOption>[]): T {
  if (props.type === ComponentType.StringSelect) {
    props.options = children.map((c) => c.props);
  }
  return props;
}
