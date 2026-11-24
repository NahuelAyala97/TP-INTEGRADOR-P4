import { flexRender, type Table } from "@tanstack/react-table";
import type { Categoria } from "../types/categoria";
import { EstadoVacio } from "@/shared/components/Estados";

interface CategoriaListProps {
  tabla: Table<Categoria>;
}

export default function CategoriaList({ tabla }: CategoriaListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-200">
          {tabla.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((header) => (
                <th
                  key={header.id}
                  className={`px-4 py-3 ${
                    header.column.id === "acciones" ? "text-right" : ""
                  }`}
                >
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc"
                        ? " ↑"
                        : header.column.getIsSorted() === "desc"
                          ? " ↓"
                          : " ↕"}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {tabla.getRowModel().rows.map((fila) => (
            <tr
              key={fila.id}
              className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              {fila.getVisibleCells().map((celda) => (
                <td key={celda.id} className="px-4 py-3">
                  {flexRender(celda.column.columnDef.cell, celda.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {tabla.getRowModel().rows.length === 0 && (
        <EstadoVacio mensaje="No hay categorías disponibles." />
      )}

      {tabla.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Página {tabla.getState().pagination.pageIndex + 1} de{" "}
            {tabla.getPageCount()}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => tabla.previousPage()}
              disabled={!tabla.getCanPreviousPage()}
              className="cursor-pointer rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              onClick={() => tabla.nextPage()}
              disabled={!tabla.getCanNextPage()}
              className="cursor-pointer rounded border px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
