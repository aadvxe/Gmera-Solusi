/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '192.168.100.12',
    '192.168.100.*',
    '192.168.*.*',
    '*.local',
  ],
};

export default nextConfig;
