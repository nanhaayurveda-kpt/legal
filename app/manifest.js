// PWA manifest — चौकी का नाम env से (clone-per-चौकी के लिए)
export default function manifest() {
  const chowki = process.env.NEXT_PUBLIC_CHOWKI_NAME || "पेशी प्रबंधन";
  return {
    name: `${chowki} — पेशी प्रबंधन`,
    short_name: chowki,
    description: "पेशी और मुवक्किल प्रबंधन",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1e293b",
    lang: "hi",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}