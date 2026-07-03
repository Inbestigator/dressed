import { expect, test } from "bun:test";
import { patternToRegex, scorePattern } from "@dressed/matcher";

test("patternToRegex: matches static", () => {
  const regex = patternToRegex("static");
  expect(regex.test("static")).toBe(true);
  expect(regex.test("STATIC")).toBe(false);
});

test("patternToRegex: matches parameter", () => {
  const regex = patternToRegex(":name");
  const match = regex.exec("hello");
  expect(match?.groups?.name).toBe("hello");
});

test("patternToRegex: matches parameter with custom regex", () => {
  const regex = patternToRegex(":num(\\d+)");
  expect(regex.test("123")).toBe(true);
  expect(regex.test("abc")).toBe(false);
});

test("patternToRegex: handles optional tokens", () => {
  const regex = patternToRegex("{:opt}");
  expect(regex.test("")).toBe(true);
  expect(regex.test("anything")).toBe(true);
});

test("scorePattern: score order plain > :n(\\d+) > {maybe} > :p", () => {
  const scores = {
    plain: scorePattern("plain"),
    typed: scorePattern(":n(\\d+)"),
    optional: scorePattern("{maybe}"),
    param: scorePattern(":p"),
  };

  expect(scores.plain).toBe(1);
  expect(scores.param).toBe(0);

  expect(scores.plain).toBeGreaterThan(scores.typed);
  expect(scores.typed).toBeGreaterThan(scores.optional);
  expect(scores.optional).toBeGreaterThan(scores.param);
});
