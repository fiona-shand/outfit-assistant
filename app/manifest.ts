import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Outfit Assistant",
    short_name: "Outfits",
    description: "Your daily work outfit, picked for the weather.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6ec",
    theme_color: "#fbf6ec",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
