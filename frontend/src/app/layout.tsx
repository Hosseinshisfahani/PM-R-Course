import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import FontLoader from "@/components/FontLoader";

export const metadata: Metadata = {
  title: "آکادمی آقای استخوان - آموزش استئوپاتی حرفه‌ای",
  description: "بهترین دوره‌های آموزشی پزشکی را با ما تجربه کنید. ما متعهد به ارائه آموزش‌های با کیفیت و کاربردی هستیم.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* Bootstrap 5 RTL CSS */}
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet" />
        {/* Font Awesome */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        {/* Persian/Farsi Fonts - Using CDN for reliability */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap" rel="stylesheet" />
        {/* AOS Animation Library */}
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <FontLoader />
        <AuthProvider>
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
        
        {/* Bootstrap 5 JS */}
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        {/* AOS Animation Library */}
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
      </body>
    </html>
  );
}
