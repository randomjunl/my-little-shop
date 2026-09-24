"use client";

import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavbarSidebar } from "./navbar-sidebar";
import { useState } from "react";
import { MenuIcon, Search, ShoppingBag, User } from "lucide-react";
import type { NavigationCategory, NavigationItem } from "@/types/navigation";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "700"],
});

interface NavItemProps extends NavigationItem {
    isActive?: boolean;
}

interface NavbarProps {
    categories: NavigationCategory[];
}

const NavbarItem = ({ href, label, isActive }: NavItemProps) => {
    return (
        <Button variant="outline" asChild className={cn("rounded-full hover:bg-transparent hover:border-primary border-transparent px-3.5 text-lg", isActive && "bg-black text-white hover:bg-black hover:text-white",)}>
            <Link href={href} aria-current={isActive ? "page" : undefined}>
                {label}
            </Link>
        </Button>
    )
}

const navbarItems: NavigationItem[] = [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
];

export const Navbar = ({ categories }: NavbarProps) => {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isShopActive = pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/category/");

    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav
                    className="min-h-16 flex items-center justify-between gap-2"
                    aria-label="Main navigation"
                >
                    {/* Left: brand */}
                    <div className="min-w-0">
                        <Link href="/" className="flex items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4" aria-label="My Little Shop home">
                            <span
                                className={`${poppins.className} text-sm sm:text-lg font-semibold tracking-tight text-slate-900`}
                            >
                                My Little Shop
                            </span>
                        </Link>
                    </div>

                    {/* Center: nav items */}
                    <div className="items-center gap-4 hidden lg:flex">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className={cn("group min-h-11 gap-2 rounded-full px-3.5 text-lg", isShopActive && "bg-black text-white hover:bg-black hover:text-white")}>
                                    Shop
                                    <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="start" sideOffset={10} className="w-64 rounded-xl p-2">
                                <DropdownMenuItem asChild className="min-h-11 rounded-lg px-3 font-medium aria-[current=page]:bg-accent">
                                    <Link href="/shop" aria-current={pathname === "/shop" ? "page" : undefined}>
                                        Shop All
                                    </Link>
                                </DropdownMenuItem>
                                {categories.length > 0 && <DropdownMenuSeparator />}
                                {categories.map((category) => (
                                    <DropdownMenuItem key={category.id} asChild className="min-h-11 rounded-lg px-3 aria-[current=page]:bg-accent">
                                        <Link href={`/category/${category.id}`} aria-current={pathname === `/category/${category.id}` ? "page" : undefined}>
                                            {category.name}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {navbarItems.map((item) => (
                            <NavbarItem key={item.href} {...item} isActive={item.href === pathname} />
                        ))}

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
