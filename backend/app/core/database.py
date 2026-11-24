from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, echo=True)


# Crea las tablas definidas en los modelos
def create_all_tables():
    SQLModel.metadata.create_all(engine)


def session_factory():
    return Session(engine)


# Proporciona una sesion de  base de datos
def get_session():
    with Session(engine) as session:
        yield session
