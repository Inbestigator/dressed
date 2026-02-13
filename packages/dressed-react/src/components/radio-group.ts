import type { APIRadioGroupComponent, APIRadioGroupOption } from "discord-api-types/v10";
import { RadioGroup as DressedComponent, RadioGroupOption as DressedOption } from "dressed";
import { createElement, type ReactElement } from "react";

export function RadioGroup(config: Omit<APIRadioGroupComponent, "type">): ReactElement<APIRadioGroupComponent> {
  const props = DressedComponent(config);
  return createElement("dressed-node", props);
}

export function RadioGroupOption({ label, value, ...rest }: APIRadioGroupOption): ReactElement<APIRadioGroupOption> {
  const props = DressedOption(label, value, rest);
  return createElement("dressed-node", props);
}
