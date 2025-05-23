type Token =
  | { match: RegExp; replace: string }
  | {
      prefix: string;
      match: RegExp;
      handler: (str: string, pos: number) => string | null;
    };

const defaultTokens: Token[] = [
  {
    match: /:([a-zA-Z0-9]+)/,
    replace: "(?<$1>.+?)",
  },
  {
    prefix: "{",
    match: /^{(.+)}/,
    handler: (content) => {
      const innerParsed = parsePattern(content);
      return `(?:${innerParsed})?`;
    },
  },
];

const escapeRegex = (str: string): string =>
  str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

function parsePattern<S extends boolean>(
  pattern: string,
  config?: { tokens?: Token[]; isScoring?: S },
): S extends true ? number : string {
  const tokens = config?.tokens ?? defaultTokens;
  let result = "";
  let i = 0;

  const replacers = tokens.filter((t) => "replace" in t);
  const handlers = tokens.filter((t) => "handler" in t);

  while (i < pattern.length) {
    let matched = false;
    const char = pattern[i];

    for (const { handler, prefix, match } of handlers) {
      if (char !== prefix) continue;
      const res = match.exec(pattern.slice(i));
      if (!res || !res[1]) continue;
      matched = true;
      const replacement = handler(res[1], i);
      if (!replacement) continue;
      result += replacement;
      i += replacement.length;
      break;
    }

    if (!matched) {
      result += escapeRegex(char);
      i++;
    }
  }

  for (const replacer of replacers) {
    result = result.replace(
      new RegExp(replacer.match, `g${replacer.match.flags}`),
      replacer.replace,
    );
  }
  if (config?.isScoring) {
    const rawLength = result.replace(/[^\\]?\(.+\)/g, "").length;
    return (rawLength / result.length) as ReturnType<typeof parsePattern<S>>;
  }
  return result as ReturnType<typeof parsePattern<S>>;
}

export const patternToRegex = (pattern: string): RegExp =>
  new RegExp(`^${parsePattern(pattern)}$`);

/** Scores dynamic-ness, higher is less dynamic */
export function scorePattern(pattern: string): number {
  return parsePattern(pattern, { isScoring: true });
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
