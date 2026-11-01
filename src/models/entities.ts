
export interface User{
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

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    categoryId: number;
}

export const usuarios: User[] = [];