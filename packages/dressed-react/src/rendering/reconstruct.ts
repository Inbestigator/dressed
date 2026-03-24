import { type APIMessageComponent, type APIModalComponent, ComponentType } from "discord-api-types/v10";
import { createElement, type ReactElement, type ReactNode } from "react";

/** Turns the JSON form of components into React elements to be rendered */
export function reconstructElementTree(components: (APIMessageComponent | APIModalComponent)[]): ReactElement[] {
  return components.map((component) => {
    let args: [object | null, ...ReactNode[]];

    switch (component.type) {
      case ComponentType.ActionRow:
      case ComponentType.Container:
        args = [component, reconstructElementTree(component.components)];
        break;
      case ComponentType.Button:
      case ComponentType.StringSelect:
      case ComponentType.TextInput:
      case ComponentType.UserSelect:
      case ComponentType.RoleSelect:
      case ComponentType.MentionableSelect:
      case ComponentType.ChannelSelect:
      case ComponentType.Thumbnail:
      case ComponentType.File:
      case ComponentType.Separator:
      case ComponentType.FileUpload:
      case ComponentType.Checkbox:
        args = [component];
        break;
      case ComponentType.Section:
        args = [component, reconstructElementTree([component.accessory]), reconstructElementTree(component.components)];
        break;
      case ComponentType.TextDisplay:
        args = [component, component.content];
        break;
      case ComponentType.MediaGallery:
        args = [component, component.items.map((i) => createElement("dressed-node", i))];
        break;
      case ComponentType.Label:
        args = [component, reconstructElementTree([component.component])];
        break;
      case ComponentType.RadioGroup:
      case ComponentType.CheckboxGroup:
        args = [component, component.options.map((o) => createElement("dressed-node", o))];
        break;
      default:
        args = [null];
    }

    return createElement("dressed-node", ...args);
  });
}
