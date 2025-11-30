import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Truncating all tables...");

    // Delete in order of dependency to avoid foreign key constraints

    // 1. Join tables first
    await prisma.dishCategory.deleteMany();
    console.log("Deleted DishCategory");

    // 2. Child tables
    await prisma.dish.deleteMany();
    console.log("Deleted Dish");

    await prisma.category.deleteMany();
    console.log("Deleted Category");

    // 3. Parent tables
    await prisma.restaurant.deleteMany();
    console.log("Deleted Restaurant");

    // 4. Root tables
    await prisma.user.deleteMany();
    console.log("Deleted User");

    console.log("All tables truncated successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
