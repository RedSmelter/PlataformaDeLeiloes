import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./interfaces/routes/AuthRoutes.js";
import auctionRoutes from "./interfaces/routes/AuctionRoutes.js";
import { createServer } from "http";
import { createSocketServer } from "./infrastructure/websocket/socketServer.js";
import { registerAuctionSocketHandlers } from "./interfaces/sockets/auctionSocketHandler.js";
import { startAuctionCloserJob } from "./interfaces/jobs/auctionCloserJob.js";
import os from "os";

async function bootstrap() {
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

  const httpServer = createServer(app);
  const io = await createSocketServer(httpServer);
  registerAuctionSocketHandlers(io);
  startAuctionCloserJob(io);

  const PORT = process.env.PORT ?? 3000;

  httpServer.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT} (instância ${os.hostname()})`);
  });
}

bootstrap();