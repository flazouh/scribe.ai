import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "green-ufo": "#16DB94",
        "pro-turquoise": "#41d1ff",
        "pro-purple": "#bd34fe",
        primary: "#1B1B1F",
        secondary: "#202128",
      },
    },
  },

  plugins: [require("tailwindcss-font-inter")],
} satisfies Config;
