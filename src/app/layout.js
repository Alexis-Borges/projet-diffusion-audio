import "./globals.css";
import Header from "../components/Header";
import Providers from "../components/Providers";
import ClientSessionProvider from "../components/Providers";

export default function RootLayout({ children, session }) {
  return (
    <html lang="fr">
      <head>
        <title>Pharmacie Audio</title>
      </head>
      <body>
        <ClientSessionProvider session={session}>
          <Providers>
            <Header />
            <main>{children}</main>
          </Providers>
        </ClientSessionProvider>
      </body>
    </html>
  );
}
