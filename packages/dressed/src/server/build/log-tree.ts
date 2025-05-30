/**
 * Log a table of values with a title (two columns max)
 *
 * Witch magic
 */
export default function logTree(total: number, title1: string, title2 = "") {
  const col1 = [title1];
  const col2 = [title2];

  return {
    push(name: string, secondaryName = "") {
      col1.push(name);
      col2.push(secondaryName);
    },
    log() {
      const m1 = Math.max(...col1.map((s) => s.length));
      const m2 = Math.max(...col2.map((s) => s.length));

      col1[0] = `\x1b[4m${col1[0]}\x1b[24m`;
      col2[0] = `\x1b[4m${col2[0]}\x1b[24m`;

      const lines = col1.map((name, i) => {
        let prefix;

        if (total === 1) {
          prefix = "-";
        } else {
          switch (i) {
            case 0:
              prefix = " ";
              break;
            case 1:
              prefix = "┌";
              break;
            case col1.length - 1:
              prefix = "└";
              break;
            default:
              prefix = "├";
          }
        }

        const primaryFormatted = name.padEnd(m1 + (!i ? 9 : 0));
        const secondaryFormatted = col2[i].padStart(m2 + (!i ? 9 : 0));

        return `${prefix} ${primaryFormatted}  ${secondaryFormatted}`;
      });

      console.log("\n" + lines.join("\n") + "\n");
    },
  };
}
