import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";

const createCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
});

const createDishSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    image: z.string().min(1, "Image is required"),
    isVeg: z.boolean(),
    spiceLevel: z.coerce.number().min(0).max(3).optional(),
    categoryIds: z.array(z.string()).min(1, "Select at least one category"),
});

export default function RestaurantDetails() {
    const router = useRouter();
    const { id } = router.query;
    const restaurantId = typeof id === "string" ? id : "";

    const { data: restaurant, refetch } = api.restaurant.getById.useQuery(
        { id: restaurantId },
        { enabled: !!restaurantId }
    );

    const [categoryOpen, setCategoryOpen] = useState(false);
    const [dishOpen, setDishOpen] = useState(false);

    const categoryForm = useForm<z.infer<typeof createCategorySchema>>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: { name: "" },
    });

    const dishForm = useForm<z.infer<typeof createDishSchema>>({
        resolver: zodResolver(createDishSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
            isVeg: true,
            spiceLevel: 0,
            categoryIds: [],
        },
    });

    const createCategoryMutation = api.menu.createCategory.useMutation({
        onSuccess: () => {
            setCategoryOpen(false);
            categoryForm.reset();
            void refetch();
        },
    });

    const createDishMutation = api.menu.createDish.useMutation({
        onSuccess: () => {
            setDishOpen(false);
            dishForm.reset();
            void refetch();
        },
    });

    const onCategorySubmit = (values: z.infer<typeof createCategorySchema>) => {
        createCategoryMutation.mutate({ ...values, restaurantId });
    };

    const onDishSubmit = (values: z.infer<typeof createDishSchema>) => {
        createDishMutation.mutate({ ...values, restaurantId });
    };

    if (!restaurant) return <div>Loading...</div>;

    return (
        <>
            <Head>
                <title>{restaurant.name} - Menu Manager</title>
            </Head>
            <main className="min-h-screen bg-slate-50 p-8">
                <div className="container mx-auto max-w-6xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{restaurant.name}</h1>
                            <p className="text-muted-foreground">{restaurant.location}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => window.open(`/menu/${restaurant.id}`, '_blank')}>
                                View Public Menu
                            </Button>
                            <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary">Add Category</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Category</DialogTitle>
                                    </DialogHeader>
                                    <Form {...categoryForm}>
                                        <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                                            <FormField
                                                control={categoryForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Category Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Starters" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full">Create</Button>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={dishOpen} onOpenChange={setDishOpen}>
                                <DialogTrigger asChild>
                                    <Button>Add Dish</Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Add Dish</DialogTitle>
                                    </DialogHeader>
                                    <Form {...dishForm}>
                                        <form onSubmit={dishForm.handleSubmit(onDishSubmit)} className="space-y-4">
                                            <FormField
                                                control={dishForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Dish Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Butter Chicken" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={dishForm.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Rich creamy curry..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={dishForm.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Price</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={dishForm.control}
                                                    name="spiceLevel"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Spice Level (0-3)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" min={0} max={3} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={dishForm.control}
                                                name="isVeg"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel>Dietary Preference</FormLabel>
                                                        <FormControl>
                                                            <div className="flex gap-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="radio"
                                                                        id="veg"
                                                                        className="accent-green-600 w-4 h-4"
                                                                        checked={field.value === true}
                                                                        onChange={() => field.onChange(true)}
                                                                    />
                                                                    <label htmlFor="veg" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                        Veg
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="radio"
                                                                        id="non-veg"
                                                                        className="accent-red-600 w-4 h-4"
                                                                        checked={field.value === false}
                                                                        onChange={() => field.onChange(false)}
                                                                    />
                                                                    <label htmlFor="non-veg" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                                        Non-Veg
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={dishForm.control}
                                                name="image"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Image</FormLabel>
                                                        <FormControl>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-4">
                                                                    {field.value && (
                                                                        <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                                                                            <img
                                                                                src={field.value}
                                                                                alt="Preview"
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <Input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onloadend = () => {
                                                                                        field.onChange(reader.result as string);
                                                                                    };
                                                                                    reader.readAsDataURL(file);
                                                                                }
                                                                            }}
                                                                        />
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Upload an image (max 4MB)
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={dishForm.control}
                                                name="categoryIds"
                                                render={() => (
                                                    <FormItem>
                                                        <FormLabel>Categories</FormLabel>
                                                        <div className="flex flex-wrap gap-2 border p-4 rounded-md">
                                                            {restaurant.categories.map((cat: { id: string; name: string }) => (
                                                                <div key={cat.id} className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        value={cat.id}
                                                                        onChange={(e) => {
                                                                            const checked = e.target.checked;
                                                                            const current = dishForm.getValues("categoryIds");
                                                                            if (checked) {
                                                                                dishForm.setValue("categoryIds", [...current, cat.id]);
                                                                            } else {
                                                                                dishForm.setValue(
                                                                                    "categoryIds",
                                                                                    current.filter((id) => id !== cat.id)
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                    <span>{cat.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="submit" className="w-full">Add Dish</Button>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {restaurant.categories.map((category: { id: string; name: string; dishes: { dish: { id: string; name: string; description: string; price: number; image: string; spiceLevel: number | null } }[] }) => (
                            <div key={category.id} className="space-y-4">
                                <h2 className="text-2xl font-semibold border-b pb-2">{category.name}</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {category.dishes.map(({ dish }) => (
                                        <Card key={dish.id} className="flex flex-col overflow-hidden">
                                            <div className="relative h-48 w-full">
                                                <img
                                                    src={dish.image}
                                                    alt={dish.name}
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                />
                                            </div>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-lg">{dish.name}</CardTitle>
                                                    <span className="font-bold">₹{dish.price}</span>
                                                </div>
                                                {dish.spiceLevel ? (
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: dish.spiceLevel }).map((_, i) => (
                                                            <span key={i} className="text-red-500">🌶️</span>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground line-clamp-3">
                                                    {dish.description}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {category.dishes.length === 0 && (
                                        <p className="text-muted-foreground italic col-span-full">No dishes in this category.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {restaurant.categories.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                No categories yet. Add one to start building your menu.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
