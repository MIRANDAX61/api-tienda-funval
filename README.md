# api-tienda-funval
## Ejecutar el proyecto

1. Instalar dependencias: npm install
2. Copiar .env.example como .env.
3. Configurar PORT=3000 y una API_KEY local en .env.
4. Generar documentación: npm run swagger
5. Iniciar servidor: npm run dev

Swagger: http://localhost:3000/api-docs

Para probar las rutas protegidas, ingresar la API_KEY
en el botón Authorize de Swagger

Los datos se almacenan en memoria y se pierden al reiniciar