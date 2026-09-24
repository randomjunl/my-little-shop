import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, User } from "lucide-react";
import { NavigationCategory } from "@/types/navigation";
import { NavigationItem } from "@/types/navigation";

interface NavbarSidebarProps {
    items: NavigationItem[];
    categories: NavigationCategory[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

// interface NavbarItem {
//     href: string;
//     label: string;
// }



export const NavbarSidebar = ({ items, categories, open, onOpenChange, children }: NavbarSidebarProps) => {

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="left" className="w-64">
                <SheetHeader>
                    <div>
                        <SheetTitle>
                            Menu
                        </SheetTitle>
                    </div>
                </SheetHeader>
                <SheetDescription className="sr-only">
                    Browse the store, visit your account, or view your cart.
                </SheetDescription>
                <ScrollArea className="min-h-0 flex-1">
                    {items.map((item) => (
                        <SheetClose asChild key={item.href}>
                            <Link href={item.href}
                                className={"w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"}>
                                {item.label}
                            </Link>
                        </SheetClose>

                    ))}
                    <section className="mt-4 border-t pt-4">
                        <h2 className="px-4 pb-2 text-sm font-semibold text-slate-500">
                            Categories
                        </h2>

                        {categories.length > 0 ? (
                            categories.map((category) => (
                                <SheetClose asChild key={category.id}>
                                    <Link
                                        href={`/category/${category.id}`}
                                        className="flex min-h-11 items-center px-4 py-3 text-base font-medium hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2]"
                                    >
                                        {category.name}
                                    </Link>
                                </SheetClose>
                            ))
                        ) : (
                            <p className="px-4 py-3 text-sm text-slate-500">
                                No categories available
                            </p>
                        )}
                    </section>
                    <div className="mt-4 border-t pt-4">
                        <SheetClose asChild>
                            <Link href="/account" className="flex min-h-11 items-center gap-3 p-4 text-base font-medium hover:bg-black hover:text-white">
                                <User className="size-5" aria-hidden="true" />
                                Your account
                            </Link>
                        </SheetClose>
                        <SheetClose asChild>
                            <Link href="/cart" className="flex min-h-11 items-center gap-3 p-4 text-base font-medium hover:bg-black hover:text-white">
                                <ShoppingBag className="size-5" aria-hidden="true" />
                                Shopping cart
                            </Link>
                        </SheetClose>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet >
    );
};
