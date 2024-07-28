import { MetadataRoute } from "next";
import { constants } from "./constants";
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: []
    },
    sitemap: [`${constants.siteUrl}/sitemap.xml`]
  };
}

