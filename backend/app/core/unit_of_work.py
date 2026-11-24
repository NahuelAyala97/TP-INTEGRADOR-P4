from app.core.database import session_factory


class UnitOfWork:
    def __enter__(self):
        self.session = session_factory()
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
