/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/propostas/[id]/pdf": ["./assets/fonts/**"],
    },
    serverComponentsExternalPackages: ["imapflow", "mailparser", "@zone-eu/mailsplit"],
  },
};

export default nextConfig;
