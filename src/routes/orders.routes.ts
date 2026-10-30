import { Router, Request, Response } from "express";
import {
    addOrderDetail,
    createOrder,
    deleteOrder,
    deleteOrderDetail,
    findOrderById,
    listOrders,
    updateOrder,
    updateOrderDetail
} from "../services/orders.service";
import { OrderStatus } from "../models/entities";

const router = Router();
const validStatuses: OrderStatus[] = [
    "pending",
    "paid",
    "shipped",
    "delivered",
    "cancelled"
];

function isPositiveNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function validateDetails(details: unknown): string | undefined {
    if (!Array.isArray(details) || details.length === 0) {
        return "details debe ser un arreglo con al menos un producto";
    }

    for (const detail of details) {
        if (
            typeof detail !== "object" ||
            detail === null ||
            typeof (detail as { productId?: unknown }).productId !== "string" ||
            !(detail as { productId: string }).productId.trim() ||
            !isPositiveNumber((detail as { quantity?: unknown }).quantity) ||
            !Number.isInteger((detail as { quantity: number }).quantity) ||
            !isPositiveNumber((detail as { unitPrice?: unknown }).unitPrice)
        ) {
            return "Cada detalle requiere productId, quantity entero positivo y unitPrice positivo";
        }
    }

    return undefined;
}

function validateCreateOrder(body: unknown): string | undefined {
    if (typeof body !== "object" || body === null) {
        return "El cuerpo de la solicitud debe ser un objeto";
    }

    const input = body as { userId?: unknown; details?: unknown };
    if (typeof input.userId !== "string" || !input.userId.trim()) {
        return "userId es obligatorio";
    }

    return validateDetails(input.details);
}

function validateDetail(body: unknown): string | undefined {
    if (typeof body !== "object" || body === null) {
        return "El cuerpo de la solicitud debe ser un objeto";
    }

    return validateDetails([body]);
}

function idFromParams(request: Request, name: string): string {
    const value = request.params[name];
    return Array.isArray(value) ? value[0] : value;
}

router.get("/", (_request: Request, response: Response) => {
    response.json(listOrders());
});

router.get("/:id", (request: Request, response: Response) => {
    const order = findOrderById(idFromParams(request, "id"));
    if (!order) {
        response.status(404).json({ mensaje: "Orden no encontrada" });
        return;
    }

    response.json(order);
});

router.post("/", (request: Request, response: Response) => {
    const error = validateCreateOrder(request.body);
    if (error) {
        response.status(400).json({ mensaje: error });
        return;
    }

    const input = request.body as { userId: string; details: Parameters<typeof createOrder>[0]["details"] };
    response.status(201).json(createOrder(input));
});

router.put("/:id", (request: Request, response: Response) => {
    const body = request.body as { status?: unknown; details?: unknown };
    if (body.status === undefined && body.details === undefined) {
        response.status(400).json({ mensaje: "Debe enviar status o details para actualizar la orden" });
        return;
    }
    if (body.status !== undefined && !validStatuses.includes(body.status as OrderStatus)) {
        response.status(400).json({ mensaje: `status debe ser uno de: ${validStatuses.join(", ")}` });
        return;
    }
    if (body.details !== undefined) {
        const error = validateDetails(body.details);
        if (error) {
            response.status(400).json({ mensaje: error });
            return;
        }
    }

    const order = updateOrder(idFromParams(request, "id"), {
        status: body.status as OrderStatus | undefined,
        details: body.details as Parameters<typeof updateOrder>[1]["details"]
    });
    if (!order) {
        response.status(404).json({ mensaje: "Orden no encontrada" });
        return;
    }

    response.json(order);
});

router.delete("/:id", (request: Request, response: Response) => {
    if (!deleteOrder(idFromParams(request, "id"))) {
        response.status(404).json({ mensaje: "Orden no encontrada" });
        return;
    }

    response.status(204).send();
});

router.post("/:orderId/details", (request: Request, response: Response) => {
    const error = validateDetail(request.body);
    if (error) {
        response.status(400).json({ mensaje: error });
        return;
    }

    const order = addOrderDetail(
        idFromParams(request, "orderId"),
        request.body as Parameters<typeof addOrderDetail>[1]
    );
    if (!order) {
        response.status(404).json({ mensaje: "Orden no encontrada" });
        return;
    }

    response.status(201).json(order);
});

router.put("/:orderId/details/:detailId", (request: Request, response: Response) => {
    const error = validateDetail(request.body);
    if (error) {
        response.status(400).json({ mensaje: error });
        return;
    }

    const order = updateOrderDetail(
        idFromParams(request, "orderId"),
        idFromParams(request, "detailId"),
        request.body as Parameters<typeof updateOrderDetail>[2]
    );
    if (!order) {
        response.status(404).json({ mensaje: "Orden o detalle no encontrado" });
        return;
    }

    response.json(order);
});

router.delete("/:orderId/details/:detailId", (request: Request, response: Response) => {
    const order = deleteOrderDetail(
        idFromParams(request, "orderId"),
        idFromParams(request, "detailId")
    );
    if (!order) {
        response.status(404).json({ mensaje: "Orden o detalle no encontrado" });
        return;
    }

    response.json(order);
});

export default router;
