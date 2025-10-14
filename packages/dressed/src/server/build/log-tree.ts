/** Log a table of values with titles */
export default function logTree(...titles: string[]) {
  const cols = titles.map((t) => [`\x1b[4m${t}\x1b[24m`]);
  const asides: Record<number, unknown[]> = {};
  const chopped = new Set<number>();
  return {
    push(...values: string[]) {
      for (let i = 0; i < values.length; ++i) {
        cols[i]?.push(values[i]);
      }
    },
    aside(v: unknown) {
      const i = cols[0].length - 1;
      asides[i] ??= [];
      asides[i].push(v);
    },
    chop: () => chopped.add(cols[0].length - 1),
    log() {
      const widths = cols.map((col) => Math.max(...col.map((s) => removeAnsiLen(s))));
      const rowCount = cols[0].length;
      const lines: unknown[] = [];
      for (let i = 0; i < rowCount; ++i) {
        const row = cols
          .map((col, j) => {
            const s = col[i] ?? "";
            const w = widths[j];
            if (j === cols.length - 1 && cols.length !== 1) {
              return " ".repeat(pad(s, w)) + s;
            } else {
              return s + " ".repeat(pad(s, w));
            }
          })
          .join("  ");
        lines.push(
          `${i === 0 ? " " : i === 1 ? (rowCount === 2 ? "-" : "┌") : i === rowCount - 1 ? "└" : "├"} ${chopped.has(i) ? "\x1b[9m" : ""}${row}\x1b[0m`,
          ...(asides[i] ?? []),
        );
      }
      lines.concat("").map((l) => console.log(l));
    },
  };
}

// biome-ignore lint/suspicious/noControlCharactersInRegex: We need a control char
const removeAnsiLen = (s: string) => s.replace(/\x1b\[\d{1,2}m/g, "").length;
const pad = (s: string, width: number) => Math.max(0, width - removeAnsiLen(s));
