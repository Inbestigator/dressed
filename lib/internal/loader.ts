import { cyan, green, red } from "@std/fmt/colors";
import process from "node:process";

export default function loader(text: string) {
  const dots = [".", "..", "..."];
  let index = 0;

  process.stdout.write("\x1b7");

  const interval = setInterval(function () {
    const logMessage = `   ${text} ${cyan(dots[index])}`;
    process.stdout.write(`\r\x1b[2K${logMessage}`);
    index = (index + 1) % dots.length;
  }, 300);

  return {
    error: () => {
      clearInterval(interval);
      process.stdout.write(`\r\x1b[2K ${red("✖")} ${text}\n`);
    },
    resolve() {
      clearInterval(interval);
      process.stdout.write(`\r\x1b[2K ${green("✔")} ${text}\n`);
    },
    stop: () => clearInterval(interval),
  };
}
