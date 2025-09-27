/** Log a table of values with a title (two columns max) */
export default function logTree(total: number, title1: string, title2 = "") {
  const col1 = [`\x1b[4m${title1}\x1b[24m`];
  const col2 = [`\x1b[4m${title2}\x1b[24m`];
  const asides: Record<number, unknown[]> = {};
  const chopped = new Set();

  return {
    push(name: string, secondaryName = "") {
      col1.push(name);
      col2.push(secondaryName);
    },
    aside(v: unknown) {
      asides[col1.length - 1] ??= [];
      asides[col1.length - 1].push(v);
    },
    chop: () => chopped.add(col1.length - 1),
    log() {
      const m1 = Math.max(...col1.map(removeAnsi));
      const m2 = Math.max(...col2.map(removeAnsi));
      const lines = col1.flatMap((name, i) => {
        let prefix = "├";
        if (i === 0) prefix = " ";
        else if (i === 1) prefix = total === 1 ? "-" : "┌";
        else if (i === col1.length - 1) prefix = "└";

        return [
          `${prefix} ${chopped.has(i) ? "\x1b[9m" : ""}${name}${" ".repeat(pad(name, m1) + pad(col2[i], m2))}${col2[i]}\x1b[0m`,
          ...(asides[i] ?? []),
        ];
      });

      lines.concat("").map((l) => console.log(l));
    },
  };
}

// biome-ignore lint/suspicious/noControlCharactersInRegex: We need a control char
const removeAnsi = (s: string) => s.replace(/\x1b\[\d{1,2}m/g, "").length;
const pad = (s: string, width: number) => Math.max(0, width - removeAnsi(s)) + 1;
