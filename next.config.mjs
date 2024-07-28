/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        minimumCacheTTL: 31536000,
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "<YOUR SUPABASE HOSTNAME>", //sirxrcuwndrxhjmywucm.supabase.co
                port: "",
                pathname: "/image/upload/**",
            },
        ],
    },
};

export default nextConfig;
