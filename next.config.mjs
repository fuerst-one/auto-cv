/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  async redirects() {
    return [
      {
        source: "/impressum",
        has: [{ type: "host", value: "portfolio.fuerst.one" }],
        destination: "https://fuerst.one/impressum",
        permanent: true,
      },
      {
        source: "/datenschutz",
        has: [{ type: "host", value: "portfolio.fuerst.one" }],
        destination: "https://fuerst.one/datenschutz",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        has: [{ type: "host", value: "portfolio.fuerst.one" }],
        destination: "https://fuerst.one/privacy",
        permanent: true,
      },
      {
        source: "/legal-notice",
        has: [{ type: "host", value: "portfolio.fuerst.one" }],
        destination: "https://fuerst.one/legal-notice",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "portfolio.fuerst.one" }],
        destination: "https://fuerst.one",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
