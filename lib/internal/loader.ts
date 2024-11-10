import { cyan, green, red } from "@std/fmt/colors";

export default function loader(text: string) {
  let dotsIndex = 0;
  const dots = [".  ", ".. ", "...", "   "];
  const animationInterval = setInterval(async () => {
    const dot = dots[dotsIndex % dots.length];
    await Deno.stdout.write(
      new TextEncoder().encode(`\r   ${text}  ${cyan(dot)}`),
    );
    dotsIndex++;
  }, 300);

  return {
    stop: () => clearInterval(animationInterval),
    resolve: async () => {
      clearInterval(animationInterval);
      await Deno.stdout.write(
        new TextEncoder().encode(`\r ${green("✔")} ${text}     \n`),
      );
    },
    error: async () => {
      clearInterval(animationInterval);
      await Deno.stdout.write(
        new TextEncoder().encode(`\r ${red("✖")} ${text}     \n`),
      );
    },
  };
}
