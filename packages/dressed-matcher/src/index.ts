type Token = {
  prefix: string;
  suffix?: string;
  handler: (str: string, pos: number) => string | null;
};

const defaultTokens: Token[] = [
  {
    prefix: ":",
    handler: (str, pos) => {
      const nameMatch = /^[a-zA-Z0-9]+/.exec(str.slice(pos + 1));
      if (!nameMatch) return null;

      const name = nameMatch[0];
      const next = pos + 1 + name.length;
      let innerMatch = ".+?";

      if (str[next] === "(") {
        let depth = 1;
        let i = next + 1;
        while (i < str.length && depth > 0) {
          if (str[i] === "(") depth++;
          else if (str[i] === ")") depth--;
          i++;
        }
        if (depth > 0) return null;

        const inner = str.slice(next, i);
        innerMatch = parsePattern(inner);
      }

      return `(?<${name}>${innerMatch})`;
    },
  },
  {
    prefix: "{",
    suffix: "}",
    handler: (content) => {
      const innerParsed = parsePattern(content);
      return `(?:${innerParsed})?`;
    },
  },
  {
    prefix: "(",
    suffix: ")",
    handler: (content) => {
      if (content.startsWith("?:")) return `(${content})`;
      const innerParsed = parsePattern(content, { preservedOperators: true });
      return `(?:${innerParsed})`;
    },
  },
];

const escapeRegex = (str: string): string =>
  str.replace(/[/\\^$*+?.()|[\]{}]/g, "\\$&");

const patternCache: Record<string, string> = {};

function parsePattern(
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

    for (const { handler, prefix, suffix } of tokens) {
      if (char !== prefix) continue;

      if (!suffix) {
        const replaced = handler(pattern, i);
        if (replaced != null) {
          result += replaced;

          const nameMatch = /^[a-zA-Z0-9_]+/.exec(pattern.slice(i + 1));
          if (!nameMatch) break;

          const next = i + 1 + nameMatch[0].length;

          if (pattern[next] === "(") {
            let depth = 1;
            let j = next + 1;
            while (j < pattern.length && depth > 0) {
              if (pattern[j] === "(") depth++;
              else if (pattern[j] === ")") depth--;
              j++;
            }
            i = j;
          } else {
            i = next;
          }

          matched = true;
          break;
        }
      } else {
        const end = (() => {
          let depth = 1;
          for (let j = i + 1; j < pattern.length; j++) {
            if (pattern[j] === prefix) depth++;
            else if (pattern[j] === suffix) depth--;
            if (depth === 0) return j;
          }
          return -1;
        })();

        if (end === -1) continue;

        const content = pattern.slice(i + 1, end);
        const replaced = handler(content, i);

        if (replaced != null) {
          result += replaced;
          i = end + 1;
          matched = true;
          break;
        }
      }
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
      i++;
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

export function matchOptimal(input: string, regexes: RegExp[]) {
  for (let i = 0; i < regexes.length; i++) {
    const regex = regexes[i];
    const match = regex.exec(input);
    if (match) {
      return { index: i, match };
    }
  }

  return { index: -1 };
}
