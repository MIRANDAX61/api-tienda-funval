# api-tienda-funval

## Órdenes

La API usa SQLite. La base de datos se crea automáticamente en `data/tienda.sqlite`
cuando se inicia el servidor.

## Instalación y ejecución

1. Instala Node.js 22.5 o superior (tu versión actual, Node 26, funciona).
2. Abre una terminal en la carpeta del proyecto.
3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Copia `.env.example` como `.env`:

   En PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

5. Inicia el servidor:

   ```bash
   npm.cmd run dev
   ```

6. Comprueba que funciona abriendo `http://localhost:3000/api/status`.

No debes crear manualmente el archivo SQLite: el servidor crea la carpeta `data`
y las tablas `orders` y `order_details` automáticamente.

### Crear una orden

`POST /api/orders`

```json
{
  "userId": "usuario-1",
  "details": [
    {
      "productId": "producto-1",
      "quantity": 2,
      "unitPrice": 10.5
    }
  ]
}
```

La respuesta incluye el `total`, que se calcula con `quantity * unitPrice`.

### Endpoints disponibles

- `GET /api/orders`: listar órdenes.
- `GET /api/orders/:id`: consultar una orden con sus detalles.
- `POST /api/orders/:orderId/details`: agregar un detalle.
- `PUT /api/orders/:id`: cambiar `status` o reemplazar los `details`.
- `PUT /api/orders/:orderId/details/:detailId`: editar un detalle.
- `DELETE /api/orders/:orderId/details/:detailId`: eliminar un detalle.
- `DELETE /api/orders/:id`: eliminar una orden.

Los estados permitidos son `pending`, `paid`, `shipped`, `delivered` y `cancelled`.