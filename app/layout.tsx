import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- CẬP NHẬT THÔNG TIN SEO ĐỂ KIẾM TIỀN ---
export const metadata: Metadata = {
  title: "Sudoku Master - Chơi Sudoku Online Miễn Phí",
  description: "Trò chơi Sudoku trí tuệ đỉnh cao với 3 mức độ, gợi ý AI thông minh và lưu kỷ lục vĩnh viễn. Thử thách bản thân và chia sẻ kỷ lục ngay!",
  keywords: ["sudoku", "sudoku online", "chơi sudoku", "game trí tuệ", "sudoku master"],
  authors: [{ name: "Nguyễn Văn Tứ" }],
  openGraph: {
    title: "Sudoku Master - Thử thách trí tuệ mỗi ngày",
    description: "Bạn có thể giải xong mức Khó trong bao lâu? Chơi ngay!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* SAU NÀY BẠN SẼ DÁN MÃ SCRIPT GOOGLE ADSENSE VÀO ĐÂY */}
        {/* <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxx" crossOrigin="anonymous"></script> */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}