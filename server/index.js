import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { prisma } from "./prisma-client.js";


dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const issuerWallet = new ethers.Wallet(process.env.ISSUER_PRIVATE_KEY, provider);
const abi = [
    "function claimTo(address user, uint256 tokenId) external",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function issuer() view returns (address)",
];
const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    issuerWallet
);


const app = express();

app.use(cors());
app.use(express.json());

async function getCardRecordBySlug(slug) {
    return prisma.card.findUnique({
        where: { slug },
        include: {
            collection: true,
        },
    });
}

async function getCardWithStatus(card) {
    try {
        const [owner, issuer] = await Promise.all([
            contract.ownerOf(card.tokenId),
            contract.issuer(),
        ]);

        return {
            ...card,
            status: owner.toLowerCase() === issuer.toLowerCase() ? "UNCLAIMED" : "CLAIMED",
        };
    } catch {
        return card;
    }
}

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/card/:slug", async (req, res) => {
    const card = await getCardRecordBySlug(req.params.slug);

    if (!card) {
        return res.status(404).json({
            ok: false,
            error: "Card not found",
        });
    }

    const resolvedCard = await getCardWithStatus(card);

    return res.json({
        ok: true,
        card: {
            slug: req.params.slug,
            tokenId: card.tokenId,
            collectionName: card.collection.name,
            serialNumber: card.serialNumber,
            serialDisplay: String(card.serialNumber).padStart(3, "0") + "/099",
            status: resolvedCard.status,
            image: "/front.jpg",
        },
    });
});

app.post("/claim", async (req, res) => {
    const { cardSlug, userWallet } = req.body;

    try {
        const card = await getCardRecordBySlug(cardSlug);

        if (!card) {
            return res.status(404).json({
                ok: false,
                error: "Card not found",
            });
        }

        const resolvedCard = await getCardWithStatus(card);

        if (resolvedCard.status === "CLAIMED") {
            return res.status(400).json({
                ok: false,
                error: "Card already claimed",
            });
        }

        const tx = await contract.claimTo(userWallet, card.tokenId);
        const receipt = await tx.wait();

        return res.json({
            ok: true,
            cardSlug,
            userWallet,
            txHash: receipt.hash,
            status: "CLAIMED",
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
