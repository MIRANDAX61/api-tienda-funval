import swaggerAutogen from "swagger-autogen";
import { resolve } from "node:path";
import { env } from "./config/env";

const doc = {
    info: {
        title: "API de la tienda",
        description: "Usuarios, categorías, productos y órdenes"
    },
    host: `localhost:${env.port}`,
    schemes: ["http"],
    securityDefinitions: {
        ApiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "x-api-key"
        }
    }
};

const outputFile = resolve(process.cwd(), "swagger-output.json");
const routes = [resolve(process.cwd(), "src/app.ts")];

swaggerAutogen()(outputFile, routes, doc);