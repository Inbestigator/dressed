import {
  ActionRow,
  Button,
  CommandOption,
  Container,
  File,
  MediaGallery,
  MediaGalleryItem,
  Section,
  SelectMenu,
  SelectMenuOption,
  Separator,
  TextDisplay,
  TextInput,
  Thumbnail,
} from "../src";
import { expect, test } from "bun:test";

test("Button component", () => {
  expect(
    Button({
      label: "Click me",
      custom_id: "button_id",
      style: "Primary",
    }),
  ).toEqual({
    type: 2,
    custom_id: "button_id",
    style: 1,
    label: "Click me",
  });
});

test("Action row component", () => {
  expect(ActionRow()).toEqual({
    type: 1,
    components: [],
  });
});

test("Command option component", () => {
  expect(
    CommandOption({
      name: "test",
      description: "test",
      type: "String",
      max_length: 10,
    }),
  ).toEqual({
    name: "test",
    description: "test",
    type: 3,
    max_length: 10,
  });
});

test("String select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "String",
      options: [SelectMenuOption("test", "test")],
    }),
  ).toEqual({
    type: 3,
    custom_id: "select_id",
    options: [{ label: "test", value: "test" }],
  });
});

test("Channel select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Channel",
    }),
  ).toEqual({
    type: 8,
    custom_id: "select_id",
  });
});

test("User select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "User",
    }),
  ).toEqual({
    type: 5,
    custom_id: "select_id",
  });
});

test("Role select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Role",
    }),
  ).toEqual({
    type: 6,
    custom_id: "select_id",
  });
});

test("Mentionable select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Mentionable",
    }),
  ).toEqual({
    type: 7,
    custom_id: "select_id",
  });
});

test("Text input component", () => {
  expect(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Short",
    }),
  ).toEqual({ label: "test", type: 4, custom_id: "input_id", style: 1 });
});

test("Text input component", () => {
  expect(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Paragraph",
    }),
  ).toEqual({
    label: "test",
    type: 4,
    custom_id: "input_id",
    style: 2,
  });
});

test("Section component", () => {
  expect(
    Section(["test"], Button({ label: "Click me", custom_id: "button_id" })),
  ).toEqual({
    components: [
      {
        content: "test",
        type: 10,
      },
    ],
    accessory: {
      type: 2,
      label: "Click me",
      custom_id: "button_id",
      style: 1,
    },
    type: 9,
  });
});

test("Text display component", () => {
  expect(TextDisplay("test")).toEqual({
    content: "test",
    type: 10,
  });
});

test("Thumbnail component", () => {
  expect(Thumbnail("https://example.com")).toEqual({
    media: { url: "https://example.com" },
    type: 11,
  });
});

test("Media gallery component", () => {
  expect(
    MediaGallery([MediaGalleryItem("https://example.com")], { id: 1 }),
  ).toEqual({
    items: [
      {
        media: { url: "https://example.com" },
      },
    ],
    id: 1,
    type: 12,
  });
});

test("File component", () => {
  expect(File("https://example.com")).toEqual({
    file: { url: "https://example.com" },
    type: 13,
  });
});

test("Separator component", () => {
  expect(Separator()).toEqual({
    spacing: 1,
    type: 14,
  });
});

test("Container component", () => {
  expect(
    Container(
      ActionRow(
        Button({ label: "Click me", custom_id: "1" }),
        Button({ label: "Click me", custom_id: "2" }),
      ),
      Separator(),
    ),
  ).toEqual({
    components: [
      {
        components: [
          {
            type: 2,
            label: "Click me",
            custom_id: "1",
            style: 1,
          },
          {
            type: 2,
            label: "Click me",
            custom_id: "2",
            style: 1,
          },
        ],
        type: 1,
      },
      {
        spacing: 1,
        type: 14,
      },
    ],
    type: 17,
  });
});
