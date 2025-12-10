import type { Metadata } from "next";
import "@picocss/pico/css/pico.min.css";

export const metadata: Metadata = {
    title: "mascotte-hex",
    description: "mascotte-hex",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="fr">
            <body>
                {children}
            </body>
        </html>
    );
}