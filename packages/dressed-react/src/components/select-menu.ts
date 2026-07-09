import { type APISelectMenuComponent, type APISelectMenuOption, ComponentType } from "discord-api-types/v10";
import { SelectMenu as DressedComponent, SelectMenuOption as DressedOption } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement, type ReactNode } from "react";
import type { Node } from "../react/node.ts";
import { registerHandler } from "../rendering/callbacks.ts";
import type { ComponentInteraction } from "../rendering/interaction.ts";

type SelectType = "Channel" | "Mentionable" | "Role" | "String" | "User";

type SelectMenuWithCustomId<K extends SelectType> = Omit<Parameters<typeof DressedComponent<K>>[0], "options"> & {
  type: K;
} & (K extends "String" ? PropsWithChildren : object);

type SelectMenuWithOnSubmit<K extends SelectType> = Omit<SelectMenuWithCustomId<K>, "custom_id"> & {
  /**
   * Create a temporary handler callback, will not work in a serverless environment
   * @warn Callbacks are deleted after 30 minutes. If you wish to have a more permanent handler, it's strongly recommended to use the [traditional component system](https://dressed.js.org/docs/components).
   */
  onSubmit: (interaction: ComponentInteraction<`${K}Select`>) => void;
  /** An additional handler identity defined in the callback setup which will run if the `onSubmit` is no longer registered */
  fallback?: string;
};

export function SelectMenu<K extends SelectType>(
  config: SelectMenuWithCustomId<K> & { type: K },
): ReactElement<ReturnType<typeof DressedComponent<K>>>;
export function SelectMenu<K extends SelectType>(
  config: SelectMenuWithOnSubmit<K> & { type: K },
): ReactElement<ReturnType<typeof DressedComponent<K>>>;

export function SelectMenu<K extends SelectType>(
  config: SelectMenuWithCustomId<K> | SelectMenuWithOnSubmit<K>,
): ReactElement<ReturnType<typeof DressedComponent<K>>> {
  const { children, ...rest } = config as Record<string, unknown>;
  const props = DressedComponent(rest as never);
  return createElement("dressed-node", props as never, children as ReactNode);
}

export function SelectMenuOption({ label, value, ...rest }: APISelectMenuOption): ReactElement<APISelectMenuOption> {
  const props = DressedOption(label, value, rest);
  return createElement("dressed-node", props);
}

export function parseSelectMenu<
  T extends APISelectMenuComponent & (Pick<SelectMenuWithOnSubmit<SelectType>, "onSubmit" | "fallback"> | object),
>(nodeId: string, props: T, children: Node<APISelectMenuOption>[]): T {
  if (props.type === ComponentType.StringSelect) {
    props.options = children.map((c) => c.props);
  }
  return {
    ...props,
    ...("onSubmit" in props ? registerHandler(nodeId, props.onSubmit as never, props.fallback) : undefined),
  };
}
