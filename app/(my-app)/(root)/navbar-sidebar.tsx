"use client";

import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ShoppingBag, User } from "lucide-react";
import type { NavigationCategory, NavigationItem } from "@/types/navigation";
import { cn } from "@/lib/utils";

interface NavbarSidebarProps {
    items: NavigationItem[];
    categories: NavigationCategory[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const linkClassName = "flex min-h-11 items-center rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-[-2] aria-[current=page]:bg-accent";

export const NavbarSidebar = ({ items, categories, open, onOpenChange, children }: NavbarSidebarProps) => {
    const pathname = usePathname();
    const isShopActive = pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/category/");

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-[90vw]">
                <SheetHeader className="border-b">
                    <SheetTitle>My Little Shop</SheetTitle>
                    <SheetDescription>Find something you love.</SheetDescription>
                </SheetHeader>
                <ScrollArea className="min-h-0 flex-1">
                    <nav aria-label="Mobile navigation" className="px-3 pb-6">
                        <Collapsible defaultOpen>
                            <CollapsibleTrigger className={cn(linkClassName, "group w-full justify-between", isShopActive && "bg-accent")}>
                                Shop
                                <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="my-2 ml-4 space-y-1 border-l pl-2">
                                    <SheetClose asChild>
                                        <Link href="/shop" className={linkClassName} aria-current={pathname === "/shop" ? "page" : undefined}>
                                            Shop All
                                        </Link>
                                    </SheetClose>
                                    {categories.map((category) => (
                                        <SheetClose asChild key={category.id}>
                                            <Link href={`/category/${category.id}`} className={linkClassName} aria-current={pathname === `/category/${category.id}` ? "page" : undefined}>
                                                {category.name}
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                        {items.map((item) => (
                            <SheetClose asChild key={item.href}>
                                <Link href={item.href} className={linkClassName} aria-current={pathname === item.href ? "page" : undefined}>
                                    {item.label}
                                </Link>
                            </SheetClose>
                        ))}
                        <div className="mt-4 space-y-1 border-t pt-4">
                            <SheetClose asChild>
                                <Link href="/account" className={cn(linkClassName, "gap-3")}>
                                    <User className="size-5" aria-hidden="true" />
                                    Your account
                                </Link>
                            </SheetClose>
                            <SheetClose asChild>
                                <Link href="/cart" className={cn(linkClassName, "gap-3")}>
                                    <ShoppingBag className="size-5" aria-hidden="true" />
                                    Shopping cart
                                </Link>
                            </SheetClose>
                        </div>
                    </nav>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};
