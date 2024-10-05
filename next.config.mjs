/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false, // Disable sharp, which is unnecessary in the browser environment
      "onnxruntime-node$": false, // Disable onnxruntime-node for browser compatibility
    };
    return config;
  },
};

export default nextConfig;
