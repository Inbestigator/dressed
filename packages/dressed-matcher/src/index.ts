interface TokenHandler {
  initiator: string;
  handler: (
    str: string,
    pos: number,
  ) => { output: string; nextPos: number } | null;
}

const tokenHandlers: TokenHandler[] = [
  {
    initiator: ":",
    handler: (str, pos) => {
      let i = pos + 1;
      const start = i;
      while (i < str.length && /[\w]/.test(str[i])) i++;
      const name = str.slice(start, i);

      return { output: `(?<${name}>.+?)`, nextPos: i };
    },
  },
  {
    initiator: "{",
    handler: (str, pos) => {
      let depth = 1;
      let i = pos + 1;
      const start = i;

      while (i < str.length && depth > 0) {
        if (str[i] === "{") depth++;
        else if (str[i] === "}") depth--;
        i++;
      }
      if (depth !== 0) throw new Error("Unterminated optional group");

      const inner = str.slice(start, i - 1);
      const innerParsed = parsePattern(inner);
      return { output: `(?:${innerParsed})?`, nextPos: i };
    },
  },
];

const escapeRegex = (str: string): string =>
  str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
function parsePattern(str: string): string {
  let result = "";
  let i = 0;

  while (i < str.length) {
    let handled = false;
    for (const handler of tokenHandlers) {
      if (str[i] !== handler.initiator) continue;
      const res = handler.handler(str, i);
      if (res) {
        result += res.output;
        i = res.nextPos;
        handled = true;
        break;
      }
    }
    if (!handled) {
      result += escapeRegex(str[i]);
      i++;
    }
  }
  return result;
}
export const patternToRegex = (pattern: string): RegExp =>
  new RegExp(`^${parsePattern(pattern)}$`);

export function scorePattern(pattern: string): number {
  let score = 0;
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === ":") {
      i++;
      if (pattern[i] === '"') {
        i++;
        while (i < pattern.length && pattern[i] !== '"') i++;
        i++;
      } else {
        while (i < pattern.length && /\w/.test(pattern[i])) i++;
      }
      score -= 1;
    } else if (char === "{") {
      let depth = 1;
      i++;
      while (i < pattern.length && depth > 0) {
        if (pattern[i] === "{") depth++;
        else if (pattern[i] === "}") depth--;
        i++;
      }
      score -= 1;
    } else {
      score++;
      i++;
    }
  }

  return score;
}

export function matchOptimal<T>(
  input: string,
  regexes: { regex: RegExp; data: T }[],
) {
  for (const { regex, data } of regexes) {
    const match = regex.exec(input);
    if (match) return { match, data };
  }

  return null;
}
