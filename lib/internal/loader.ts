import { cyan, green, red } from "@std/fmt/colors";
import process from "node:process";

export default function loader(text: string) {
  const dots = ["⠏", "⠹", "⠸", "⠼", "⠧", "⠇"];
  let index = 0;

  process.stdout.write("\x1b7");

  const interval = setInterval(function () {
    process.stdout.write(`\r\x1b[2K ${cyan(dots[index])} ${text}`);
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
