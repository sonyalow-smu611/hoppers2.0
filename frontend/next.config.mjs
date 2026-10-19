import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
// const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

const backendUrl = (
  process.env.BACKEND_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "")
).replace(/\/$/, ""); // strip trailing slash defensively

if (!backendUrl) {
  throw new Error(
    "BACKEND_URL is not set. Configure it in the Vercel project's Environment Variables " +
    "to the backend's full origin, e.g. https://hoppers2-0-5lfw.vercel.app"
  );
}

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      { source: "/lists/:path*", destination: `${backendUrl}/lists/:path*` },
      { source: "/cafes/:path*", destination: `${backendUrl}/cafes/:path*` },
      { source: "/posts/:path*", destination: `${backendUrl}/posts/:path*` },
      { source: "/users/:path*", destination: `${backendUrl}/users/:path*` },
    ];
  },
};

export default nextConfig;
