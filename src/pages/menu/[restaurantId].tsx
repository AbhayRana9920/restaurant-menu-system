import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/utils/cn";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { Menu as MenuIcon } from "lucide-react";

function DishItem({ dish }: { dish: { id: string; name: string; description: string; price: number; image: string; isVeg: boolean; spiceLevel: number | null } }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="flex gap-4 border-b pb-6 last:border-0">
            <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                    <div className="mt-1">
                        <div className={cn("border p-[2px] rounded-sm", dish.isVeg ? "border-green-600" : "border-red-600")}>
                            <div className={cn("w-2 h-2 rounded-full", dish.isVeg ? "bg-green-600" : "bg-red-600")}></div>
                        </div>
                    </div>
                    {dish.spiceLevel ? (
                        <div className="flex items-center border rounded px-1 text-xs text-red-500 border-red-200 bg-red-50">
                            {Array.from({ length: dish.spiceLevel }).map((_, i) => (
                                <span key={i}>🌶️</span>
                            ))}
                        </div>
                    ) : null}
                </div>
                <h3 className="font-bold text-slate-900">{dish.name}</h3>
                <p className="font-medium text-slate-900">₹ {dish.price}</p>
                <p className={cn("text-sm text-slate-500", !expanded && "line-clamp-2")}>
                    {dish.description}
                </p>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-sm font-bold text-slate-700 mt-1"
                >
                    {expanded ? "read less" : "read more"}
                </button>
            </div>
            <div className="relative w-32 h-32 flex-shrink-0">
                <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover rounded-xl shadow-sm"
                />
                <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 shadow-md bg-white text-green-600 hover:bg-slate-50 font-bold border"
                >
                    ADD
                </Button>
            </div>
        </div>
    );
}

export default function PublicMenu() {
    const router = useRouter();
    const { restaurantId } = router.query;
    const id = typeof restaurantId === "string" ? restaurantId : "";

    const { data: restaurant } = api.restaurant.getById.useQuery(
        { id },
        { enabled: !!id }
    );

    const [activeCategory, setActiveCategory] = useState<string>("");
    const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll spy to update active category
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200; // Offset for header

            for (const category of restaurant?.categories ?? []) {
                const element = categoryRefs.current[category.id];
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveCategory(category.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [restaurant]);

    const scrollToCategory = (categoryId: string) => {
        const element = categoryRefs.current[categoryId];
        if (element) {
            const headerOffset = 140; // Height of sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
            setActiveCategory(categoryId);
        }
    };

    if (!restaurant) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <>
            <Head>
                <title>{restaurant.name} - Menu</title>
            </Head>
            <main className="min-h-screen bg-white pb-24">
                {/* Restaurant Header */}
                <div className="bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-slate-900">{restaurant.name}</h1>
                    <p className="text-muted-foreground">{restaurant.location}</p>
                </div>

                {/* Sticky Category Header */}
                <div className="sticky top-0 z-10 bg-white shadow-md">
                    <div className="flex overflow-x-auto p-4 gap-4 no-scrollbar" ref={scrollContainerRef}>
                        {restaurant.categories.map((category: { id: string; name: string }) => (
                            <button
                                key={category.id}
                                onClick={() => scrollToCategory(category.id)}
                                className={cn(
                                    "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors",
                                    activeCategory === category.id
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                )}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Menu Items */}
                <div className="container mx-auto max-w-2xl p-4 space-y-8">
                    {restaurant.categories.map((category: { id: string; name: string; dishes: { dish: { id: string; name: string; description: string; price: number; image: string; isVeg: boolean; spiceLevel: number | null } }[] }) => (
                        <div
                            key={category.id}
                            ref={(el) => { categoryRefs.current[category.id] = el; }}
                            className="scroll-mt-32"
                        >
                            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">
                                {category.name}
                            </h2>
                            <div className="space-y-6">
                                {category.dishes.map(({ dish }) => (
                                    <DishItem key={dish.id} dish={dish} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Menu Button */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="lg" className="rounded-full px-8 shadow-xl bg-red-500 hover:bg-red-600 text-white gap-2">
                                <MenuIcon className="w-5 h-5" />
                                Menu
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-xl max-h-[80vh] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle className="text-center">Menu</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-1">
                                {restaurant.categories.map((category: { id: string; name: string; dishes: any[] }) => (
                                    <div
                                        key={category.id}
                                        className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer"
                                        onClick={() => {
                                            scrollToCategory(category.id);
                                            // Close sheet logic would go here if controlled
                                        }}
                                    >
                                        <span className="font-medium text-slate-700">{category.name}</span>
                                        <span className="text-slate-500">{category.dishes.length}</span>
                                    </div>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </main>
        </>
    );
}
