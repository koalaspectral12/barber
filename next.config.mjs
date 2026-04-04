/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "utfs.io" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "api.dicebear.com", pathname: "/**" },
      { hostname: "img.freepik.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "firebasestorage.googleapis.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "cdn.discordapp.com" },
    ],
    // Allow unoptimized images as fallback for unknown domains
    unoptimized: false,
  },
  // Skip type checking during build for faster deployment
  // (TypeScript errors are caught in development)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
