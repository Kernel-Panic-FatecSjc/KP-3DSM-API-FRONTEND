'use client';
import "./globals.css";
import NavigationBar from "@/components/layout/navegationBar/navegationBar";
import ProtectedRoute from "@/components/ProtectedRoute/ProtectedRoute";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login";

  return (
    <html lang="pt-br">
      <head>
        <title>GSW Soluções Integradas</title>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body>
        {!hideNavbar && (
          <header style={{ position: 'relative', zIndex: 9999 }}>
            <NavigationBar />
          </header>
        )}
        <ProtectedRoute>
          <main className="main-wrapper">
            {children}
          </main>
        </ProtectedRoute>

      </body>
    </html>
  );
}