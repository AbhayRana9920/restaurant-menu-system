import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const menuRouter = createTRPCRouter({
    createCategory: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            restaurantId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify ownership
            const restaurant = await ctx.db.restaurant.findUnique({
                where: { id: input.restaurantId },
            });
            if (!restaurant || restaurant.ownerId !== ctx.user.id) {
                throw new Error("Unauthorized");
            }

            return ctx.db.category.create({
                data: {
                    name: input.name,
                    restaurantId: input.restaurantId,
                },
            });
        }),

    createDish: protectedProcedure
        .input(z.object({
            name: z.string().min(1),
            description: z.string(),
            price: z.number().min(0),
            image: z.string().url(),
            isVeg: z.boolean().default(true),
            spiceLevel: z.number().min(0).max(3).optional(),
            restaurantId: z.string(),
            categoryIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            // Verify ownership
            const restaurant = await ctx.db.restaurant.findUnique({
                where: { id: input.restaurantId },
            });
            if (!restaurant || restaurant.ownerId !== ctx.user.id) {
                throw new Error("Unauthorized");
            }

            const dish = await ctx.db.dish.create({
                data: {
                    name: input.name,
                    description: input.description,
                    price: input.price,
                    image: input.image,
                    isVeg: input.isVeg,
                    spiceLevel: input.spiceLevel,
                    restaurantId: input.restaurantId,
                },
            });

            // Link to categories
            if (input.categoryIds.length > 0) {
                await ctx.db.dishCategory.createMany({
                    data: input.categoryIds.map((catId) => ({
                        dishId: dish.id,
                        categoryId: catId,
                    })),
                });
            }

            return dish;
        }),

    getMenu: publicProcedure
        .input(z.object({ restaurantId: z.string() }))
        .query(async ({ ctx, input }) => {
            const categories = await ctx.db.category.findMany({
                where: { restaurantId: input.restaurantId },
                include: {
                    dishes: {
                        include: {
                            dish: true,
                        },
                    },
                },
            });
            return categories;
        }),
});
