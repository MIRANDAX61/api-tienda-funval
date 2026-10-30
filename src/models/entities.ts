export type OrderStatus =
    | "pending"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled";

export interface OrderDetail {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Order {
    id: string;
    userId: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    updatedAt: string;
    details: OrderDetail[];
}