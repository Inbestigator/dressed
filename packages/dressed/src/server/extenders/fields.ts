import {
  type APIAttachment,
  type APIInteractionDataResolved,
  type APIInteractionDataResolvedChannel,
  type APIRole,
  type APIUser,
  ComponentType,
  type ModalSubmitComponent,
} from "discord-api-types/v10";
import type { Requirable } from "../../types/utilities.ts";

export interface FieldValueGetters {
  /** Return the select menu's values as an array of strings - Component must be a select with type `String` */
  stringSelect: () => string[];
  /** Return the input's value as a string - Component must be a text input */
  textInput: () => string;
  /** Return the select menu's values as an array of users - Component type must be a select with type `User` */
  userSelect: () => APIUser[];
  /** Return the select menu's values as an array of roles - Component type must be a select with type `Role` */
  roleSelect: () => APIRole[];
  /** Return the select menu's values as an array of users and roles (mentionables) - Component type must be a select with type `Mentionable` */
  mentionableSelect: () => (APIUser | APIRole)[];
  /** Return the select menu's values as an array of channels - Component type must be a select with type `Channel` */
  channelSelect: () => APIInteractionDataResolvedChannel[];
  /** Return the file upload's values as an array of attachments - Component type must be a select with type `FileUpload` */
  fileUpload: () => APIAttachment[];
}

const blurbs = {
  3: "a string select",
  4: "a text input",
  5: "a user select",
  6: "a role select",
  7: "a mentionable select",
  8: "a channel select",
  19: "a file upload",
};

export function getField<R extends boolean>(
  custom_id: string,
  required: R,
  components: ModalSubmitComponent[],
  resolved?: APIInteractionDataResolved,
): Requirable<R, FieldValueGetters> {
  const component = components.find((c) => c.custom_id === custom_id);
  if (!component) {
    if (required) throw new Error(`Required field "${custom_id}" not found`);
    return undefined as ReturnType<typeof getField<R>>;
  }

  const returnValue = (type: ModalSubmitComponent["type"], resolvedKey?: keyof APIInteractionDataResolved) => () => {
    if (component.type !== type) {
      throw new Error(`The field ${custom_id} is ${blurbs[component.type]}, not ${blurbs[type]}`);
    }
    if (component.type === ComponentType.TextInput) {
      return component.value;
    } else {
      if (resolvedKey) {
        if (!resolved?.[resolvedKey]) {
          throw new Error(`No ${resolvedKey} found for field ${component.custom_id}`);
        }
        const resolveds = [];
        for (const value of component.values) {
          resolveds.push(resolved[resolvedKey][value]);
        }
        return resolveds;
      }
      return component.values;
    }
  };

  // TODO Remove this assign and just return the getters before next major release
  return Object.assign(component.type === ComponentType.TextInput ? component.value : {}, {
    stringSelect: returnValue(ComponentType.StringSelect),
    textInput: returnValue(ComponentType.TextInput),
    userSelect: returnValue(ComponentType.UserSelect, "users"),
    roleSelect: returnValue(ComponentType.RoleSelect, "roles"),
    mentionableSelect() {
      if (component.type !== ComponentType.MentionableSelect) {
        throw new Error(`The field ${component.custom_id} is ${blurbs[component.type]}, not a mentionable select`);
      }
      if (!resolved?.users && !resolved?.roles) {
        throw new Error(`No mentionables found for field ${component.custom_id}`);
      }
      const mentionables = [];
      for (const value of component.values) {
        mentionables.push(resolved.users?.[value] ?? resolved.roles?.[value]);
      }
      return mentionables;
    },
    channelSelect: returnValue(ComponentType.ChannelSelect, "channels"),
    fileUpload: returnValue(ComponentType.FileUpload, "attachments"),
  }) as ReturnType<typeof getField<R>>;
}
