import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const restaurantRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({
            name: z.string().min(2),
            location: z.string().min(2),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.restaurant.create({
                data: {
                    name: input.name,
                    location: input.location,
                    ownerId: ctx.user.id,
                },
            });
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        return ctx.db.restaurant.findMany({
            where: { ownerId: ctx.user.id },
            orderBy: { createdAt: "desc" },
        });
    }),

    getPublicRestaurants: publicProcedure.query(async ({ ctx }) => {
        return ctx.db.restaurant.findMany({
            select: {
                id: true,
                name: true,
                location: true,
            },
        });
    }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.restaurant.findUnique({
                where: { id: input.id },
                include: {
                    categories: {
                        include: {
                            dishes: {
                                include: {
                                    dish: true,
                                },
                            },
                        },
                    },
                },
            });
        }),
});
