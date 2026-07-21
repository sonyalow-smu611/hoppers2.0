import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/lists/:path*",
        destination: `${backendUrl}/lists/:path*`,
      },
      {
        source: "/cafes/:path*",
        destination: `${backendUrl}/cafes/:path*`,
      },
      {
        source: "/posts/:path*",
        destination: `${backendUrl}/posts/:path*`,
      },
      {
        source: "/users/:path*",
        destination: `${backendUrl}/users/:path*`,
      },
    ];
  },
};

export default nextConfig;
