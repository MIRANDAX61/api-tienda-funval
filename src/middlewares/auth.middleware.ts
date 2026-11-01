import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

export function validarApiKey(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const apiKey = req.get("x-api-key");

    if (!env.apiKey || apiKey !== env.apiKey) {
        res.status(401).json({
            ok: false,
            mensaje: "Acceso no autorizado"
        });
        return;
    }

    next();
}