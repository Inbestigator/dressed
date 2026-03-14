import type { APIRadioGroupComponent, APIRadioGroupOption } from "discord-api-types/v10";
import { RadioGroup as DressedComponent, RadioGroupOption as DressedOption } from "dressed";
import { createElement, type PropsWithChildren, type ReactElement } from "react";
import type { ComponentNode } from "../react/renderer.ts";

export function RadioGroup({
  children,
  ...rest
}: PropsWithChildren<Omit<APIRadioGroupComponent, "options" | "type">>): ReactElement<APIRadioGroupComponent> {
  const props = DressedComponent(rest as never);
  return createElement("dressed-node", props, children);
}

export function RadioGroupOption({ label, value, ...rest }: APIRadioGroupOption): ReactElement<APIRadioGroupOption> {
  const props = DressedOption(label, value, rest);
  return createElement("dressed-node", props);
}

export async function parseRadioGroup<T extends APIRadioGroupComponent>(
  props: T,
  children: ComponentNode[],
): Promise<T> {
  return { ...props, options: children.map((c) => c.props) };
}
