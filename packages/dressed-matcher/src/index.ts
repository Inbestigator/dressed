export type { Params } from "./types.ts";

export interface Token {
  prefix: string;
  suffix?: string;
  handler: (
    str: string,
    pos: number,
    tokens: Token[],
  ) => [string, number] | null;
}

/** Default tokens used in `parsePattern` */
export const defaultTokens: Token[] = [
  {
    prefix: ":",
    handler: (str, pos, tokens) => {
      const nameMatch = /^[a-zA-Z0-9]+/.exec(str);
      if (!nameMatch) return null;

      const name = nameMatch[0];
      let next = name.length;
      let innerMatch = ".+?";

      if (str[next] === defaultTokens[2].prefix) {
        const parsed = parseToken(str.slice(next), defaultTokens[2], tokens);
        if (!parsed) return null;
        innerMatch = parsed[0];
        next += pos + parsed[1];
      }

      return [`(?<${name}>${innerMatch})`, pos + 1 + next];
    },
  },
  {
    prefix: "{",
    suffix: "}",
    handler: (content, end) => {
      const innerParsed = parsePattern(content);
      return [`(?:${innerParsed})?`, end + 1];
    },
  },
  {
    prefix: "(",
    suffix: ")",
    handler: (content, end) => {
      const innerParsed = parsePattern(content, { preservedOperators: true });
      return [`(?:${innerParsed})`, end + 1];
    },
  },
];

const escapeRegex = (str: string): string =>
  str.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");

const patternCache: Record<string, string> = {};

/** Pattern is expected to already be sliced such that pattern[0] is the token prefix */
function parseToken(
  pattern: string,
  { handler, prefix, suffix }: Token,
  tokens: Token[],
) {
  if (pattern[0] !== prefix) return null;
  let end;

  if (suffix) {
    let depth = 1;
    for (let j = 1; j < pattern.length; ++j) {
      if (pattern[j] === prefix) {
        ++depth;
      } else if (pattern[j] === suffix) {
        --depth;
        if (depth === 0) {
          end = j;
          break;
        }
      }
    }
    if (!end) return null;
  }

  return handler(pattern.slice(1, end), end ?? 0, tokens);
}

/** Generates the contents of the regex */
export function parsePattern(
  pattern: string,
  config?: { tokens?: Token[]; preservedOperators?: string[] | true },
): string {
  if (patternCache[pattern]) {
    return patternCache[pattern];
  }
  const tokens = config?.tokens ?? defaultTokens;
  let result = "";
  let i = 0;

  while (i < pattern.length) {
    let matched = false;
    const char = pattern[i];

    for (const token of tokens) {
      if (char !== token.prefix) continue;
      const parsed = parseToken(pattern.slice(i), token, tokens);
      if (!parsed) continue;
      result += parsed[0];
      i += parsed[1];
      matched = true;
      break;
    }

    if (!matched) {
      if (
        config?.preservedOperators === true ||
        config?.preservedOperators?.includes(char)
      ) {
        result += char;
      } else {
        result += escapeRegex(char);
      }
      ++i;
    }
  }

  patternCache[pattern] = result;

  return result;
}

export const patternToRegex = (pattern: string): RegExp =>
  new RegExp(`^${parsePattern(pattern)}$`);

/** Scores dynamic-ness, higher is less dynamic */
export function scorePattern(pattern: string): number {
  const regex = parsePattern(pattern);
  const rawLength = regex.replace(/\(\?.+?\)/g, "").length;
  return (rawLength * (regex.match(/\(\?/g)?.length ?? 1)) / regex.length;
}

/**
 * Returns the first regex that matches the input, regexes are expected to be sorted using `scorePattern`
 */
export function matchOptimal(input: string, regexes: RegExp[]) {
  for (let i = 0; i < regexes.length; ++i) {
    const regex = regexes[i];
    const match = regex.exec(input);
    if (match) {
      return { index: i, match };
    }
  }

  return { index: -1 };
}
