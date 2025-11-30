import { useState } from "react";
import Head from "next/head";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import Link from "next/link";

const createRestaurantSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    location: z.string().min(2, "Location must be at least 2 characters"),
});

export default function Dashboard() {
    const [open, setOpen] = useState(false);
    const { data: restaurants, refetch } = api.restaurant.getAll.useQuery();

    const form = useForm<z.infer<typeof createRestaurantSchema>>({
        resolver: zodResolver(createRestaurantSchema),
        defaultValues: { name: "", location: "" },
    });

    const createMutation = api.restaurant.create.useMutation({
        onSuccess: () => {
            setOpen(false);
            form.reset();
            void refetch();
        },
    });

    const onSubmit = (values: z.infer<typeof createRestaurantSchema>) => {
        createMutation.mutate(values);
    };

    return (
        <>
            <Head>
                <title>Dashboard - Restaurant Manager</title>
            </Head>
            <main className="min-h-screen bg-slate-50 p-8">
                <div className="container mx-auto max-w-5xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Your Restaurants</h1>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button>Add Restaurant</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Restaurant</DialogTitle>
                                    <DialogDescription>
                                        Create a new restaurant to manage its menu.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Restaurant Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Super Restaurant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Mumbai" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                                            {createMutation.isPending ? "Creating..." : "Create Restaurant"}
                                        </Button>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {restaurants?.map((restaurant: { id: string; name: string; location: string }) => (
                            <Link key={restaurant.id} href={`/dashboard/restaurant/${restaurant.id}`}>
                                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                    <CardHeader>
                                        <CardTitle>{restaurant.name}</CardTitle>
                                        <CardDescription>{restaurant.location}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Click to manage menu
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                        {restaurants?.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No restaurants found. Create one to get started.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
