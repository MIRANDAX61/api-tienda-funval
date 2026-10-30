import express from "express";
import { env } from "./config/env";
import "./database/database";
import ordersRouter from "./routes/orders.routes";

const app = express();

app.use(express.json());
app.use("/api/orders", ordersRouter);

app.get("/api/status", function (req, res) {
    res.status(200).json({
        ok: true,
        mensaje: "API de la tienda funcionando"
    });
});

app.listen(env.port, function () {
    console.log(`Entorno: ${env.nodeEnv}`);
    console.log(`Servidor corriendo en http://localhost:${env.port}`);
});

export default app;