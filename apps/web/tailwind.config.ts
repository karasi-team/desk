import type { Config } from "tailwindcss";
import preset from "@karasi/ui/tailwind-preset";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [preset]
};

export default config;
