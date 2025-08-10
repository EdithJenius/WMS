import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

export const metadata: Metadata = {
  title: "潮玩盲盒库存管理系统",
  description: "专业的潮玩盲盒库存管理系统，支持进货管理、出货管理、库存查询等功能",
  keywords: ["潮玩", "盲盒", "库存管理", "进货", "出货", "Next.js", "TypeScript"],
  authors: [{ name: "潮玩库存管理团队" }],
  openGraph: {
    title: "潮玩盲盒库存管理系统",
    description: "专业的潮玩盲盒库存管理系统",
    url: "http://localhost:3000",
    siteName: "潮玩盲盒库存管理系统",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "潮玩盲盒库存管理系统",
    description: "专业的潮玩盲盒库存管理系统",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "潮玩盲盒库存管理系统",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className="antialiased bg-background text-foreground"
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
