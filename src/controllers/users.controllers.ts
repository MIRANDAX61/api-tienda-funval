import type { Request, Response } from "express";
import { usuarios } from "../models/entities";
import type { User, UserBody } from "../models/entities";

let siguienteId: number = 1;

export function listUsers(req: Request, res: Response) {
    // #swagger.tags = ['Usuarios']
    // #swagger.description = 'Obtiene todos los usuarios'
    // #swagger.security = [{ "ApiKeyAuth": [] }]

    res.status(200).json({
        ok: true,
        total: usuarios.length,
        data: usuarios
    });
}

export function createUser(
    req: Request<{}, {}, UserBody>,
    res: Response
) {
    // #swagger.tags = ['Usuarios']
    // #swagger.description = 'Crea un usuario'
    // #swagger.security = [{ "ApiKeyAuth": [] }]

    const { name, email, role } = req.body ?? {};

    if (
        typeof name !== "string" || name.trim() === "" ||
        typeof email !== "string" || email.trim() === "" ||
        typeof role !== "string" || role.trim() === ""
    ) {
        res.status(400).json({
            ok: false,
            mensaje: "name, email y role deben ser textos no vacíos"
        });
        return;
    }

    const nuevoUsuario: User = {
        id: siguienteId,
        name: name.trim(),
        email: email.trim(),
        role: role.trim(),
        createdAt: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    siguienteId++;

    res.status(201).json({
        ok: true,
        mensaje: "Usuario creado correctamente",
        data: nuevoUsuario
    });
}

export function getUserById(req: Request, res: Response) {
    // #swagger.tags = ['Usuarios']
    // #swagger.description = 'Busca un usuario por ID'
    // #swagger.security = [{ "ApiKeyAuth": [] }]

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            ok: false,
            mensaje: "El ID debe ser un entero positivo"
        });
        return;
    }

    const usuarioEncontrado = usuarios.find(
        (usuario) => usuario.id === id
    );

    if (!usuarioEncontrado) {
        res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
        return;
    }

    res.status(200).json({
        ok: true,
        data: usuarioEncontrado
    });
}

export function updateUser(
    req: Request<{ id: string }, {}, UserBody>,
    res: Response
) {
    // #swagger.tags = ['Usuarios']
    // #swagger.description = 'Actualiza un usuario por ID'
    // #swagger.security = [{ "ApiKeyAuth": [] }]

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            ok: false,
            mensaje: "El ID debe ser un entero positivo"
        });
        return;
    }

    const usuarioEncontrado = usuarios.find(
        (usuario) => usuario.id === id
    );

    if (!usuarioEncontrado) {
        res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
        return;
    }

    const { name, email, role } = req.body ?? {};

    if (
        typeof name !== "string" || name.trim() === "" ||
        typeof email !== "string" || email.trim() === "" ||
        typeof role !== "string" || role.trim() === ""
    ) {
        res.status(400).json({
            ok: false,
            mensaje: "name, email y role deben ser textos no vacíos"
        });
        return;
    }

    usuarioEncontrado.name = name.trim();
    usuarioEncontrado.email = email.trim();
    usuarioEncontrado.role = role.trim();

    res.status(200).json({
        ok: true,
        mensaje: "Usuario actualizado correctamente",
        data: usuarioEncontrado
    });
}

export function deleteUser(req: Request, res: Response) {
    // #swagger.tags = ['Usuarios']
    // #swagger.description = 'Elimina un usuario por ID'
    // #swagger.security = [{ "ApiKeyAuth": [] }]

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({
            ok: false,
            mensaje: "El ID debe ser un entero positivo"
        });
        return;
    }

    const posicion = usuarios.findIndex(
        (usuario) => usuario.id === id
    );

    if (posicion === -1) {
        res.status(404).json({
            ok: false,
            mensaje: "Usuario no encontrado"
        });
        return;
    }

    usuarios.splice(posicion, 1);

    res.status(200).json({
        ok: true,
        mensaje: "Usuario eliminado correctamente"
    });
}