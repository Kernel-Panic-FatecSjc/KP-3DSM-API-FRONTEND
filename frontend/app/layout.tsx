import "./globals.css";
import NavigationBar from "@/components/layout/navegationBar/navegationBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body>
        <header style={{ position: 'relative', zIndex: 9999 }}>
          <NavigationBar />
        </header>
        <main className="main-wrapper">
          {children}
        </main>
      </body>
    </html>
  );
}