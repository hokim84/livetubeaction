import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 썸네일은 YouTube CDN에서 직접 가져온다. 일부공개 영상도 이 경로로 정상 제공된다.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
