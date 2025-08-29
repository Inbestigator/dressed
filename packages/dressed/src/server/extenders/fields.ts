import {
  ComponentType,
  type ModalSubmitComponent,
} from "discord-api-types/v10";
import type { Requirable } from "../../types/utilities.ts";

export interface FieldValueGetters {
  /** Return the input's value as a string - Component type must be `TextInput` */
  textInput: () => string;
  /** Return the select menu's values as an array of strings - Component type must be `StringSelect` */
  stringSelect: () => string[];
}

// prettier-ignore
const blurbs = ["a string select", "a text input"];

export function getField<R extends boolean>(
  custom_id: string,
  required: R,
  components: ModalSubmitComponent[],
): Requirable<R, FieldValueGetters> {
  const component = components.find((c) => c.custom_id === custom_id);
  if (!component) {
    if (required) throw new Error(`Required field "${custom_id}" not found`);
    return undefined as ReturnType<typeof getField<R>>;
  }

  const returnOption = (type: ModalSubmitComponent["type"]) => () => {
    if (component.type !== type) {
      throw new Error(
        `The field ${custom_id} is ${blurbs[component.type - 3]}, not ${blurbs[type - 3]}`,
      );
    }
    if (component.type === ComponentType.TextInput) {
      return component.value;
    } else {
      return component.values;
    }
  };

  // TODO Remove this assign and just return the getters before next major release
  return Object.assign(
    component.type === ComponentType.TextInput ? component.value : "",
    {
      textInput: returnOption(ComponentType.TextInput),
      stringSelect: returnOption(ComponentType.StringSelect),
    },
  ) as ReturnType<typeof getField<R>>;
}
