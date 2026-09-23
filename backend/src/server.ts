import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./interfaces/routes/AuthRoutes.js";
import auctionRoutes from "./interfaces/routes/AuctionRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);

app.get("/", (req, res) => {
    res.json({
        title: 'Plataforma de Leilões',
        message: 'Servidor funfannnnte!'
    });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});