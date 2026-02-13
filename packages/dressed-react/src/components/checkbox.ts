import type { APICheckboxComponent, APICheckboxGroupComponent, APICheckboxGroupOption } from "discord-api-types/v10";
import { Checkbox as DressedComponent, CheckboxGroup as DressedGroupComponent } from "dressed";
import { createElement, type ReactElement } from "react";

export function Checkbox(config: Omit<APICheckboxComponent, "type">): ReactElement<APICheckboxComponent>;

export function Checkbox(config: APICheckboxGroupOption): ReactElement<APICheckboxGroupOption>;

export function Checkbox(
  config: Omit<APICheckboxComponent, "type"> | APICheckboxGroupOption,
): ReactElement<APICheckboxComponent | APICheckboxGroupOption> {
  const props =
    "label" in config
      ? DressedComponent(config.label, config.value, {
          default: config.default,
          description: config.description,
        })
      : DressedComponent(config);
  return createElement("dressed-node", props as never);
}

export function CheckboxGroup(
  config: Omit<APICheckboxGroupComponent, "type">,
): ReactElement<APICheckboxGroupComponent> {
  const props = DressedGroupComponent(config);
  return createElement("dressed-node", props);
}
