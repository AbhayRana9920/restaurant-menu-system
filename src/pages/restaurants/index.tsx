import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function PublicRestaurantList() {
    // Note: We need a public procedure to get all restaurants. 
    // Currently 'getAll' is protected. We should create a public one or use a different router.
    // For now, let's assume we will add a public 'getPublicRestaurants' procedure.
    const { data: restaurants, isLoading } = api.restaurant.getPublicRestaurants.useQuery();

    return (
        <>
            <Head>
                <title>All Restaurants - Public Access</title>
            </Head>
            <main className="min-h-screen bg-slate-50 p-8">
                <div className="container mx-auto max-w-5xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-slate-900">Select a Restaurant</h1>
                        <p className="text-muted-foreground mt-2">
                            (Simulating a customer scanning a QR code)
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="text-center">Loading...</div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {restaurants?.map((restaurant: { id: string; name: string; location: string }) => (
                                <Link key={restaurant.id} href={`/menu/${restaurant.id}`}>
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                        <CardHeader>
                                            <CardTitle>{restaurant.name}</CardTitle>
                                            <CardDescription>{restaurant.location}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button variant="secondary" className="w-full">
                                                View Menu
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                            {restaurants?.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No restaurants found.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
