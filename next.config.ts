import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The project sits directly under the home directory; without this Turbopack
  // walks up and tries to treat the whole home folder as the workspace root.
  turbopack: {
    root: path.resolve("."),
  },
};

export default nextConfig;
