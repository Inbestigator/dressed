import { cyan, green, red } from "@std/fmt/colors";

export default function loader(text: string) {
  let dotsIndex = 0;
  const dots = [".  ", ".. ", "...", "   "];
  const animationInterval = setInterval(() => {
    const dot = dots[dotsIndex % dots.length];
    console.log(`\r\x1b[K ${text}  ${cyan(dot)}`);
    dotsIndex++;
  }, 300);

  return {
    stop: () => clearInterval(animationInterval),
    resolve: () => {
      clearInterval(animationInterval);
      console.log(`\r\x1b[K ${green("✔")} ${text}`);
    },
    error: () => {
      clearInterval(animationInterval);
      console.log(`\r\x1b[K ${red("✖")} ${text}`);
    },
  };
}
