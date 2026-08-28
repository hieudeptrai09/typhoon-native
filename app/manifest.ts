import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cá Tra's Typhoons App",
    short_name: "Typhoons",
    description:
      "Comprehensive typhoon database featuring storm tracking, intensity analysis, and the fascinating stories behind typhoon names",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    theme_color: "#ffffff",
    background_color: "#ffffff",
    display: "standalone",
    orientation: "portrait",
  };
}
