import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Neonadri",
  description: "Meet someone. Share your story.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}