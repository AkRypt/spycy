import { MetadataRoute } from "next";
import { constants } from "./constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const defaultPages = [
        {
            url: constants.siteUrl,
            priority: 1
        },
        {
            url: `${constants.siteUrl}/lobby`,
            priority: 0.9
        }
    ];

    const sitemap = defaultPages;

    return sitemap;
}