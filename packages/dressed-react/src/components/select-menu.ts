import { type APISelectMenuComponent, type APISelectMenuOption, ComponentType } from "discord-api-types/v10";
import { SelectMenu as DressedComponent, SelectMenuOption as DressedOption } from "dressed";
import { createElement, type ReactElement, type ReactNode } from "react";
import type { Node } from "../react/node.ts";
import { registerHandler } from "../rendering/callbacks.ts";
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
  config: SelectMenuWithCustomId<K> & { type: K },
): ReactElement<SelectMap[`${K}Select`]>;
export function SelectMenu<K extends SelectType>(
  config: SelectMenuWithOnClick<K> & { type: K },
): ReactElement<SelectMap[`${K}Select`]>;

export function SelectMenu<K extends SelectType>(
  config: SelectMenuWithCustomId<K> | SelectMenuWithOnClick<K>,
): ReactElement<SelectMap[`${K}Select`]> {
  const { children, ...rest } = config as Record<string, unknown>;
  const props = DressedComponent(rest as never);
  return createElement("dressed-node", props as never, children as ReactNode);
}

export function SelectMenuOption({ label, value, ...rest }: APISelectMenuOption): ReactElement<APISelectMenuOption> {
  const props = DressedOption(label, value, rest);
  return createElement("dressed-node", props);
}

export function parseSelectMenu<
  T extends APISelectMenuComponent & (Pick<SelectMenuWithOnClick<SelectType>, "onSubmit" | "fallback"> | object),
>(nodeId: string, props: T, children: Node<APISelectMenuOption>[]): T {
  if (props.type === ComponentType.StringSelect) {
    props.options = children.map((c) => c.props);
  }
  return {
    ...props,
    ...("onSubmit" in props ? registerHandler(nodeId, props.onSubmit as never, props.fallback) : undefined),
  };
}
