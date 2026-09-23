import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "true";
const config: NextConfig = {
  ...(staticExport
    ? { output: "export", basePath: "/Smullies2ndHalf", trailingSlash: true }
    : {}),
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default config;
