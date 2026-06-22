import { prisma } from "./prisma-client.js";

async function main() {
    const collection = await prisma.collection.upsert({
        where: { slug: "singapore-gp-2026" },
        update: {},
        create: {
            name: "Singapore GP 2026",
            slug: "singapore-gp-2026",
        },
    });

    const card1 = await prisma.card.upsert({
        where: { tokenId: "1" },
        update: {
            slug: "test-card",
        },
        create: {
            collectionId: collection.id,
            tokenId: "1",
            serialNumber: 1,
            status: "CLAIMED",
            isActive: true,
            slug: "test-card",
        },
    });

    const card2 = await prisma.card.upsert({
        where: { tokenId: "2" },
        update: {
            slug: "test-card-2",
        },
        create: {
            collectionId: collection.id,
            tokenId: "2",
            serialNumber: 2,
            status: "UNCLAIMED",
            isActive: true,
            slug: "test-card-2",
        },
    });

    console.log("Seeded:", {
        collection: collection.slug,
        card1: card1.tokenId,
        card2: card2.tokenId,
    });
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
