import { Provider } from "@/components/ui/provider";
import { AuthProvider } from "./_components/auth_provider";
import Navbar from "./_components/navbar";

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
