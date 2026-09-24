"use client";

import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavbarSidebar } from "./navbar-sidebar";
import { useState } from "react";
import { MenuIcon, Search, ShoppingBag, User } from "lucide-react";
import { NavigationCategory, NavigationItem } from "@/types/navigation";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"],
});

interface NavItemProps extends NavigationItem {
    isActive?: boolean;
    children?: React.ReactNode;
}

interface NavbarProps {
    categories: NavigationCategory[];
}

const NavbarItem = ({ href, label, isActive }: NavItemProps) => {
    return (
        <Button variant="outline" asChild className={cn("rounded-full hover:bg-transparent hover:border-primary border-transparent px-3.5 text-lg", isActive && "bg-black text-white hover:bg-black hover:text-white",)}>
            <Link href={href}>
                {label}
            </Link>
        </Button>
    )
}

const navbarItems: NavigationItem[] = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export const Navbar = ({ categories }: NavbarProps) => {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav
                    className="min-h-16 flex items-center justify-between gap-2"
                    aria-label="Main navigation"
                >
                    {/* Left: brand */}
                    <div className="min-w-0">
                        <Link href="/" className="flex items-center">
                            <span
                                className={`${poppins.className} text-sm sm:text-lg font-semibold tracking-tight text-slate-900`}
                            >
                                My Little Shop
                            </span>
                        </Link>
                    </div>

                    {/* Center: nav items */}
                    <div className="items-center gap-4 hidden lg:flex">
                        {
                            navbarItems.map((item) => (
                                <NavbarItem label={item.label} key={item.href} href={item.href} isActive={item.href === pathname}>
                                </NavbarItem>
                            ))
                        }
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2">
                                    Categories
                                    <ChevronDown className="size-4" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start">
                                {categories.length > 0 ? (
                                    categories.map((category) => (
                                        <DropdownMenuItem key={category.id} asChild>
                                            <Link href={`/category/${category.id}`}>
                                                {category.name}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <DropdownMenuItem disabled>
                                        No categories available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                    {/* Shopping controls are separate from the browsing links. */}
                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                        {/* Enable Search when the search panel is implemented. */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-11"
                            disabled
                            aria-label="Search (coming soon)"
                        >
                            <Search aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="hidden size-11 lg:inline-flex">
                            <Link href="/account" aria-label="Your account">
                                <User aria-hidden="true" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild className="size-11">
                            <Link href="/cart" aria-label="Shopping cart">
                                <ShoppingBag aria-hidden="true" />
                            </Link>
                        </Button>
                        <NavbarSidebar items={navbarItems} categories={categories} open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                            <Button type="button" variant="ghost" size="icon" className="size-11 lg:hidden" aria-label="Open menu">
                                <MenuIcon aria-hidden="true" />
                            </Button>
                        </NavbarSidebar>
                    </div>
                </nav>
            </div >
        </header >
    );
};
