# Food Store - Trabajo Práctico Integrador

**Alumno:** Nahuel Alfredo Ayala
**Materia:** Programación IV
**Institución:** UTN

## Descripción

Food Store es una aplicación web para gestionar una tienda online.

Permite consultar productos, registrarse, iniciar sesión, realizar compras y consultar pedidos. También cuenta con un panel administrativo para gestionar categorías, productos, usuarios y pedidos.

## Tecnologías utilizadas

### Backend

- Python
- FastAPI
- SQLModel
- PostgreSQL
- JWT con cookies HttpOnly
- Patrón Repository y Unit of Work

### Frontend

- React con TypeScript
- Vite
- Tailwind CSS
- TanStack Query, Table y Form
- Zustand
- React Router
- Axios

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Python
- uv
- PostgreSQL
- Node.js
- pnpm

## Configuración del backend

1. Crear una base de datos PostgreSQL llamada `foodstore_db`.
2. Abrir una terminal dentro de `backend`.
3. Crear el archivo `.env` utilizando `.env.example` como referencia.
4. Configurar la conexión a PostgreSQL y las demás variables de entorno.
5. Instalar las dependencias:

```bash
uv sync
```

Si se utiliza `requirements.txt`, también se pueden instalar con:

```bash
uv pip install -r requirements.txt
```

6. Ejecutar los datos iniciales:

```bash
uv run python -m app.db.seed
```

7. Iniciar el servidor:

```bash
uv run fastapi dev app/main.py
```

**API:** http://localhost:8000

**Swagger:** http://localhost:8000/docs

### Datos iniciales

El seed crea:

- Un usuario administrador.
- Tres categorías.
- Ocho productos.

El seed es idempotente y puede ejecutarse nuevamente sin duplicar los datos iniciales.

**Administrador de prueba:**

- Usuario: `admin`
- Contraseña: `Admin1234!`

Estas credenciales son únicamente para el entorno local de desarrollo.

## Configuración del frontend

1. Abrir otra terminal dentro de `frontend`.
2. Crear `.env` a partir de `.env.example`.
3. Configurar la variable:

```dotenv
VITE_API_URL=http://localhost:8000
```

4. Instalar las dependencias:

```bash
pnpm install
```

5. Iniciar la aplicación:

```bash
pnpm dev
```

Abrir en el navegador:

http://localhost:5173

### Compilación

Para comprobar la compilación del frontend:

```bash
pnpm build
```

## Funcionalidades principales

### Cliente

- Registro e inicio de sesión.
- Consulta y búsqueda de productos.
- Carrito de compras.
- Creación de pedidos.
- Consulta del historial de pedidos.
- Cancelación de pedidos permitidos.

### Administrador

- Gestión de categorías.
- Gestión de productos y stock.
- Gestión de usuarios.
- Consulta y actualización de pedidos.
- Resumen administrativo.

## Reglas de negocio

- Se valida el stock antes de confirmar una compra.
- El stock se descuenta al crear el pedido.
- Al cancelar un pedido permitido, el stock se restituye.
- Los pedidos respetan sus transiciones de estado.
- Los usuarios solo pueden consultar sus propios pedidos.
- Las operaciones administrativas requieren el rol correspondiente.

## Demostración

Video del funcionamiento:

**Enlace:** https://www.youtube.com/watch?v=1YRxRJChlqM

La demostración incluye registro, inicio de sesión, compra, administración de pedidos y cancelación con restitución del stock.

## Repositorio

**GitHub:** https://github.com/NahuelAyala97/TP-INTEGRADOR-P4

## Consideraciones

Los archivos `.env` contienen configuraciones locales y no deben publicarse en el repositorio.

Se incluyen archivos `.env.example` como referencia para configurar el proyecto.
