import { randomUUID } from "node:crypto";
import { database } from "../database/database";
import { Order, OrderDetail, OrderStatus } from "../models/entities";

export interface CreateOrderDetailInput {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderInput {
    userId: string;
    details: CreateOrderDetailInput[];
}

export interface UpdateOrderInput {
    status?: OrderStatus;
    details?: CreateOrderDetailInput[];
}

interface OrderRow {
    id: string;
    user_id: string;
    status: OrderStatus;
    total: number;
    created_at: string;
    updated_at: string;
}

interface DetailRow {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

function calculateSubtotal(quantity: number, unitPrice: number): number {
    return Number((quantity * unitPrice).toFixed(2));
}

function mapDetail(row: DetailRow): OrderDetail {
    return {
        id: row.id,
        orderId: row.order_id,
        productId: row.product_id,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        subtotal: row.subtotal
    };
}

function mapOrder(row: OrderRow): Order {
    const details = database
        .prepare(
            `SELECT id, order_id, product_id, quantity, unit_price, subtotal
             FROM order_details WHERE order_id = ? ORDER BY rowid`
        )
        .all(row.id) as unknown as DetailRow[];

    return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        total: Number(row.total.toFixed(2)),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        details: details.map(mapDetail)
    };
}

function findOrderRow(id: string): OrderRow | undefined {
    return database
        .prepare(
            `SELECT id, user_id, status, total, created_at, updated_at
             FROM orders WHERE id = ?`
        )
        .get(id) as unknown as OrderRow | undefined;
}

function updateTotal(orderId: string): void {
    database
        .prepare(
            `UPDATE orders
             SET total = (SELECT COALESCE(SUM(subtotal), 0) FROM order_details WHERE order_id = ?),
                 updated_at = ?
             WHERE id = ?`
        )
        .run(orderId, new Date().toISOString(), orderId);
}

function insertDetails(orderId: string, details: CreateOrderDetailInput[]): void {
    const statement = database.prepare(
        `INSERT INTO order_details
         (id, order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`
    );

    for (const detail of details) {
        statement.run(
            randomUUID(),
            orderId,
            detail.productId,
            detail.quantity,
            detail.unitPrice,
            calculateSubtotal(detail.quantity, detail.unitPrice)
        );
    }
}

export function listOrders(): Order[] {
    const rows = database
        .prepare(
            `SELECT id, user_id, status, total, created_at, updated_at
             FROM orders ORDER BY created_at DESC`
        )
        .all() as unknown as OrderRow[];

    return rows.map(mapOrder);
}

export function findOrderById(id: string): Order | undefined {
    const row = findOrderRow(id);
    return row ? mapOrder(row) : undefined;
}

export function createOrder(input: CreateOrderInput): Order {
    const id = randomUUID();
    const now = new Date().toISOString();

    database.exec("BEGIN");
    try {
        database
            .prepare(
                `INSERT INTO orders (id, user_id, status, total, created_at, updated_at)
                 VALUES (?, ?, 'pending', 0, ?, ?)`
            )
            .run(id, input.userId, now, now);
        insertDetails(id, input.details);
        updateTotal(id);
        database.exec("COMMIT");
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }

    return findOrderById(id) as Order;
}

export function updateOrder(id: string, input: UpdateOrderInput): Order | undefined {
    if (!findOrderRow(id)) {
        return undefined;
    }

    database.exec("BEGIN");
    try {
        if (input.status !== undefined) {
            database.prepare("UPDATE orders SET status = ? WHERE id = ?").run(input.status, id);
        }
        if (input.details !== undefined) {
            database.prepare("DELETE FROM order_details WHERE order_id = ?").run(id);
            insertDetails(id, input.details);
        }
        updateTotal(id);
        database.exec("COMMIT");
    } catch (error) {
        database.exec("ROLLBACK");
        throw error;
    }

    return findOrderById(id);
}

export function deleteOrder(id: string): boolean {
    const result = database.prepare("DELETE FROM orders WHERE id = ?").run(id);
    return result.changes > 0;
}

export function addOrderDetail(
    orderId: string,
    input: CreateOrderDetailInput
): Order | undefined {
    if (!findOrderRow(orderId)) {
        return undefined;
    }

    insertDetails(orderId, [input]);
    updateTotal(orderId);
    return findOrderById(orderId);
}

export function updateOrderDetail(
    orderId: string,
    detailId: string,
    input: CreateOrderDetailInput
): Order | undefined {
    const result = database
        .prepare(
            `UPDATE order_details
             SET product_id = ?, quantity = ?, unit_price = ?, subtotal = ?
             WHERE id = ? AND order_id = ?`
        )
        .run(
            input.productId,
            input.quantity,
            input.unitPrice,
            calculateSubtotal(input.quantity, input.unitPrice),
            detailId,
            orderId
        );

    if (result.changes === 0) {
        return undefined;
    }

    updateTotal(orderId);
    return findOrderById(orderId);
}

export function deleteOrderDetail(orderId: string, detailId: string): Order | undefined {
    const result = database
        .prepare("DELETE FROM order_details WHERE id = ? AND order_id = ?")
        .run(detailId, orderId);
    if (result.changes === 0) {
        return undefined;
    }

    updateTotal(orderId);
    return findOrderById(orderId);
}
