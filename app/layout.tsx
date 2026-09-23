import type { Metadata } from "next";
import { StoreProvider } from "@/components/store";
import { Shell } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "MealPrep Planner — jouw voeding, goed geregeld",
  description:
    "Persoonlijke voedingsdoelen, slimme mealprep en één praktische boodschappenlijst. Alles lokaal in je browser.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <StoreProvider>
          <Shell>{children}</Shell>
        </StoreProvider>
      </body>
    </html>
  );
}
