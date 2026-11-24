import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto mt-20 max-w-md px-4 text-center">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-gray-800">
          Acceso no autorizado
        </h1>

        <p className="mb-6 text-gray-600">
          No tenés permisos para acceder a esta página.
        </p>

        <Link
          to="/categorias"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
