import { Inter } from "next/font/google";
import { Footer } from "./footer"
const inter = Inter({ subsets: ["latin"] });
import { ModalProvider } from "@/providers/modal-provider";
import type { Metadata } from "next";

import "./globals.css";
import { Navbar } from "./(root)/navbar";

import configPromise from "@payload-config";
import { getPayload } from "payload";
import type { NavigationCategory } from "@/types/navigation";


export const metadata: Metadata = {
  title: "My Little Shop",
  description: "Discover pre-loved finds, artwork, and handmade creations at My Little Shop.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: NavigationCategory[] = [];

  try {
    const payload = await getPayload({ config: configPromise });

    const result = await payload.find({
      collection: "categories",
      where: {
        parent: { exists: false },
      },
      select: {
        name: true,
        slug: true,
      },
      depth: 0,
      sort: "name",
      limit: 100,
      overrideAccess: false,
    });

    categories = result.docs.map(({ id, name, slug }) => ({
      id,
      name,
      slug,
    }));
  } catch (error) {
    console.error("Unable to load navigation categories:", error);
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar categories={categories} />
        <ModalProvider />
        {children}
        <Footer />
      </body>
    </html>
  );
}
