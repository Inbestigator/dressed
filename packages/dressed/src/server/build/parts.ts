/**
 * Log a table of values with a title (two columns max)
 *
 * Witch magic
 */
export function trackParts(total: number, title1: string, title2 = "") {
  const col1 = [title1];
  const col2 = [title2];
  let leftN = total;
  return {
    addRow: (name: string, secondaryName?: string) => {
      --leftN;
      col1.push(
        `${total === 1 ? "-" : leftN === total - 1 ? "┌" : leftN === 0 ? "└" : "├"} ${name}`,
      );
      col2.push(secondaryName ?? "");
    },
    log: () => {
      const longests = [col1, col2].map((c) =>
        Math.max(...c.map((s) => s.length)),
      );
      console.log(
        `\n${new Array(total + 1)
          .fill(0)
          .map(
            (_, i) =>
              `${[
                [col1, longests[0], "padEnd"] as const,
                [col2, longests[1], "padStart"] as const,
              ]
                .map((p) =>
                  i === 0
                    ? `\x1b[4m${p[0][0]}\x1b[24m`[p[2]](p[1] + 9, " ")
                    : p[0][i][p[2]](p[1] ?? 0, " "),
                )
                .join("  ")}`,
          )
          .join("\n")}\n`,
      );
    },
  };
}
