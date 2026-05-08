import "./globals.css";

export const metadata = {
  title: "부산 동구 맛집",
  description: "부산 동구의 숨겨진 보석 같은 맛집들을 탐험해보세요.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "부산 동구 맛집",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header className="header">
          <div className="container header-content">
            <div className="logo">
              <span className="text-gradient">Busan</span> Dong-gu
            </div>
            <nav className="nav-links">
              <a href="#" className="nav-link">홈</a>
              <a href="#" className="nav-link">추천 맛집</a>
              <a href="#" className="nav-link">지도 보기</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <p>© 2026 Busan Dong-gu Food Explorer. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
