// TODO remove this file
import "discord-api-types/v10";

declare module "discord-api-types/v10" {
  enum ComponentType {
    RadioGroup = 21,
    CheckboxGroup = 22,
    Checkbox = 23,
  }

  interface APIRadioGroupComponent {
    type: ComponentType.RadioGroup; // 21
    id?: number;
    custom_id: string;
    options: APIRadioGroupOption[]; // 2-10
    required?: boolean;
  }

  interface APIRadioGroupOption {
    value: string;
    label: string;
    description?: string;
    default?: boolean;
  }

  interface APICheckboxGroupComponent {
    type: ComponentType.CheckboxGroup; // 22
    id?: number;
    custom_id: string;
    options: APICheckboxGroupOption[]; // 1-10
    min_values?: number; // 0-10, defaults to 1
    max_values?: number; // 1-10, defaults to len(options)
    required?: boolean;
  }

  interface APICheckboxGroupOption {
    value: string;
    label: string;
    description?: string;
    default?: boolean;
  }

  interface APICheckboxComponent {
    type: ComponentType.Checkbox; // 23
    id?: number;
    custom_id: string;
    default?: boolean;
  }
}
