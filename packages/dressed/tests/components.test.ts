import { expect, test } from "bun:test";
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
} from "dressed";

test("Button component", () => {
  expect(
    Button({
      label: "Click me",
      custom_id: "button_id",
      style: "Primary",
    }),
  ).toMatchSnapshot();
});

test("Action row component", () => {
  expect(ActionRow()).toMatchSnapshot();
});

test("Command option component", () => {
  expect(
    CommandOption({
      name: "test",
      description: "test",
      type: "String",
      max_length: 10,
    }),
  ).toMatchSnapshot();
});

test("String select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "String",
      options: [SelectMenuOption("test", "test")],
    }),
  ).toMatchSnapshot();
});

test("Channel select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Channel",
    }),
  ).toMatchSnapshot();
});

test("User select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "User",
    }),
  ).toMatchSnapshot();
});

test("Role select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Role",
    }),
  ).toMatchSnapshot();
});

test("Mentionable select menu component", () => {
  expect(
    SelectMenu({
      custom_id: "select_id",
      type: "Mentionable",
    }),
  ).toMatchSnapshot();
});

test("Text input component", () => {
  expect(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Short",
    }),
  ).toMatchSnapshot();
});

test("Text input component", () => {
  expect(
    TextInput({
      label: "test",
      custom_id: "input_id",
      style: "Paragraph",
    }),
  ).toMatchSnapshot();
});

test("Section component", () => {
  expect(Section(["test"], Button({ label: "Click me", custom_id: "button_id" }))).toMatchSnapshot();
});

test("Text display component", () => {
  expect(TextDisplay("test")).toMatchSnapshot();
});

test("Thumbnail component", () => {
  expect(Thumbnail("https://example.com")).toMatchSnapshot();
});

test("Media gallery component", () => {
  expect(MediaGallery([MediaGalleryItem("https://example.com")], { id: 1 })).toMatchSnapshot();
});

test("File component", () => {
  expect(File("https://example.com")).toMatchSnapshot();
});

test("Separator component", () => {
  expect(Separator()).toMatchSnapshot();
});

test("Container component", () => {
  expect(
    Container(
      ActionRow(Button({ label: "Click me", custom_id: "1" }), Button({ label: "Click me", custom_id: "2" })),
      Separator(),
    ),
  ).toMatchSnapshot();
});
