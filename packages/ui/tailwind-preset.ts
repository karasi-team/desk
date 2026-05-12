import type { Config } from "tailwindcss";

const preset: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#f3f8f6",
          100: "#d9ede6",
          300: "#7fc4b0",
          500: "#0f8a70",
          700: "#0b6b57",
          900: "#09493d",
          950: "#062f27"
        },
        coral: {
          50: "#fff4f2",
          100: "#ffe4de",
          300: "#ffad9f",
          500: "#ff6f61",
          700: "#d94f42",
          900: "#8f2f27"
        },
        surface: "#f3f8f6",
        ink: "#143127"
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Lato", "sans-serif"]
      },
      boxShadow: {
        studio: "0 20px 60px -30px rgba(9, 73, 61, 0.45)"
      }
    }
  }
};

export default preset;
