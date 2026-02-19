import type { APICheckboxComponent, APICheckboxGroupComponent, APICheckboxGroupOption } from "discord-api-types/v10";
import { Checkbox as DressedComponent, CheckboxGroup as DressedGroupComponent } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import type { ComponentNode } from "../react/renderer.ts";

export function Checkbox(config: Omit<APICheckboxComponent, "type">): ReactElement<APICheckboxComponent>;

export function Checkbox(config: APICheckboxGroupOption): ReactElement<APICheckboxGroupOption>;

export function Checkbox(
  config: Omit<APICheckboxComponent, "type"> | APICheckboxGroupOption,
): ReactElement<APICheckboxComponent | APICheckboxGroupOption> {
  const props = "label" in config ? DressedComponent(config.label, config.value, config) : DressedComponent(config);
  return createElement("dressed-node", props as never);
}

export function CheckboxGroup({
  children,
  ...rest
}: PropsWithChildren<Omit<APICheckboxGroupComponent, "options" | "type">>): ReactElement<APICheckboxGroupComponent> {
  const props = DressedGroupComponent(rest as never);
  return createElement("dressed-node", props, children);
}

export async function parseCheckboxGroup<T extends APICheckboxGroupComponent>(
  props: T,
  children: ComponentNode[],
): Promise<T> {
  return { ...props, options: children.map((c) => c.props) };
}
