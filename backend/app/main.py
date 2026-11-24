from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.categoria.router import router as categoria_router
from app.core.database import create_all_tables
from app.modules.usuarios import model as usuarios_model
from app.modules.usuarios.router import router as auth_router
from app.pedido.router import router as pedido_router
from app.producto.router import router as producto_router


# Crea las tablas al iniciar la aplicacion
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="FOODSTORE",
    description="API con FastAPI, SQLModel y PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
)

# Habilita cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# registra los endpoints
app.include_router(categoria_router, prefix="/api/v1")
app.include_router(producto_router, prefix="/api/v1")
app.include_router(pedido_router, prefix="/api/v1")
app.include_router(auth_router)
