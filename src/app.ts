import express from "express";
import { env } from "./config/env";
import apiRouter from "./routes";
import cors from "cors";
import { logger } from "./middlewares/logger.middleware";
import { validarApiKey } from "./middlewares/auth.middleware";

const app = express();

app.use(logger);

app.use(cors({
    origin: env.corsOrigin
}));

app.use(express.json());

app.get("/api/status", function (req, res) {
    res.status(200).json({
        ok: true,
        mensaje: "API de la tienda funcionando"
    });
});

app.use("/api", validarApiKey, apiRouter);

app.listen(env.port, function () {
    console.log(`Entorno: ${env.nodeEnv}`);
    console.log(`Servidor corriendo en http://localhost:${env.port}`);
});