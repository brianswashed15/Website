import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  site: "https://riyoproductions.com",
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter Tight",
      cssVariable: "--font-inter-tight",
      weights: [400, 500, 600],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-jetbrains-mono",
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
});
