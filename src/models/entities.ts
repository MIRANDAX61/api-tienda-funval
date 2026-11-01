
// USUARIOS
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface UserBody {
    name: string;
    email: string;
    role: string;
}

// CATEGORÍAS
export interface Category {
    id: number;
    name: string;
    description: string;
}

export interface CategoryBody {
    name: string;
    description: string;
}

// PRODUCTOS
export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    categoryId: number;
}

export interface ProductBody {
    name: string;
    price: number;
    stock: number;
    categoryId: number;
}

// ÓRDENES
export interface Order {
    id: number;
    userId: number;
    totalAmount: number;
    status: "pendiente" | "completada";
    date: string;
}

export interface OrderBody {
    userId: number;
    totalAmount: number;
    status: "pendiente" | "completada";
}

// BASE DE DATOS SIMULADA
export const usuarios: User[] = [];
export const categorias: Category[] = [];
export const productos: Product[] = [];
export const ordenes: Order[] = [];