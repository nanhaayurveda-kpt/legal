import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

// देवनागरी + latin (हिंदी टेक्स्ट और अंक/अंग्रेज़ी दोनों के लिए)
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: process.env.NEXT_PUBLIC_CHOWKI_NAME || "पेशी प्रबंधन",
  description: "पेशी और मुवक्किल प्रबंधन",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body className={notoDevanagari.className}>{children}</body>
    </html>
  );
}
