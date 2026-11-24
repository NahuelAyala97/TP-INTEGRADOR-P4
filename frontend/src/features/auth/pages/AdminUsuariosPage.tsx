import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import { useAdminUsuarios } from "../hooks/useAdminUsuarios";
import type { Usuario } from "../types/auth.types";

import { EstadoCarga, EstadoError } from "@/shared/components/Estados";

export default function AdminUsuariosPage() {
  // Obtiene los usuarios y las acciones desde el hook
  const {
    usuarios,
    isPending,
    isError,
    error,
    usuarioActualId,
    cambiarEstado,
    procesandoId,
  } = useAdminUsuarios();

  // Define las columnas de la tabla
  const columnas: ColumnDef<Usuario>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "username",
      header: "Usuario",
    },
    {
      accessorKey: "full_name",
      header: "Nombre completo",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rol",
    },
    {
      id: "estado",
      header: "Estado",
      cell: ({ row }) => (row.original.disabled ? "Desactivado" : "Activo"),
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const usuario = row.original;

        // Evita desactivar la cuenta del administrador actual
        const esMiCuenta = usuario.id === usuarioActualId;

        return (
          <button
            type="button"
            disabled={
              procesandoId !== null || (esMiCuenta && !usuario.disabled)
            }
            onClick={() => cambiarEstado(usuario)}
            className={`cursor-pointer rounded-md px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 ${
              usuario.disabled
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {procesandoId === usuario.id
              ? "Procesando..."
              : esMiCuenta && !usuario.disabled
                ? "Tu cuenta"
                : usuario.disabled
                  ? "Activar"
                  : "Desactivar"}
          </button>
        );
      },
    },
  ];

  // Configura TanStack Table con paginacion
  const tabla = useReactTable({
    data: usuarios,
    columns: columnas,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">Administración de usuarios</h1>

        {/* Muestra errores al modificar un usuario */}
        {error && (
          <p
            role="alert"
            className="mb-4 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {isPending ? (
          <EstadoCarga mensaje="Cargando usuarios..." />
        ) : isError ? (
          <EstadoError mensaje="No se pudieron cargar los usuarios." />
        ) : (
          <>
            {/* Tabla de usuarios */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  {tabla.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} className="p-4 font-semibold">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>

                <tbody>
                  {tabla.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {tabla.getRowModel().rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columnas.length}
                        className="p-6 text-center text-gray-500 dark:text-gray-400"
                      >
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Controles de paginacion */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={!tabla.getCanPreviousPage()}
                onClick={() => tabla.previousPage()}
                className="cursor-pointer rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="text-sm">
                Página {tabla.getState().pagination.pageIndex + 1} de{" "}
                {tabla.getPageCount()}
              </span>

              <button
                type="button"
                disabled={!tabla.getCanNextPage()}
                onClick={() => tabla.nextPage()}
                className="cursor-pointer rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
