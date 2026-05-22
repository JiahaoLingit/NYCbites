import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "./_components/auth_provider";
import Navbar from "./_components/navbar";
import Script from "next/script"

export const metadata = {
  title: "NYC Bites — Find Your Next Meal",
  description: "Discover the best restaurants in New York City based on your cravings, budget, and neighborhood.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
        />
        <AuthProvider>
          <Provider>
            <Navbar />
            {children}
          </Provider>
        </AuthProvider>
      </body>
    </html>
  );
}
