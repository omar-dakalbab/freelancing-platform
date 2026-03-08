import type { MetadataRoute } from "next";
import { BRAND_NAME, LOGO_ICON } from "@/components/ui/logo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description:
      "Connect with vetted freelancers or find your next great project. Secure payments, fast matching, and milestone-based contracts.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#1a1a2e",
    icons: [
      {
        src: LOGO_ICON,
        sizes: "600x600",
        type: "image/png",
      },
    ],
  };
}
