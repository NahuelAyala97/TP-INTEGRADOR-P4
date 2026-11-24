import { useAuthStore } from "@/features/auth";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";

import type { Categoria } from "../types/categoria";
import type { CategoriaRequest } from "../services/categoria";

import CategoriaList from "../components/CategoriaList";
import CategoriaModal from "../components/CategoriaModal";
import { useCategories } from "../hooks/useCategories";

export default function CategoriasPage() {
  // Comprueba si el usuario tiene permisos de administrador
  const esAdmin = useAuthStore((state) => state.usuario?.role === "admin");

  const {
    categorias,
    isPending,
    isError,
    crearMutacion,
    actualizarMutacion,
    eliminarMutacion,
  } = useCategories();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<Categoria | null>(null);

  const [ordenamiento, setOrdenamiento] = useState<SortingState>([]);

  // Abre el modal para crear
  function abrirCrear() {
    setCategoriaSeleccionada(null);
    setModalAbierto(true);
  }

  // Abre el modal para editar
  function abrirEditar(categoria: Categoria) {
    setCategoriaSeleccionada(categoria);
    setModalAbierto(true);
  }

  // Cierra el modal
  function cerrarModal() {
    setModalAbierto(false);
    setCategoriaSeleccionada(null);
  }

  // Guarda una categoría
  function guardarCategoria(datos: CategoriaRequest) {
    if (categoriaSeleccionada) {
      actualizarMutacion.mutate(
        {
          id: categoriaSeleccionada.id,
          datos,
        },
        { onSuccess: cerrarModal },
      );
    } else {
      crearMutacion.mutate(datos, { onSuccess: cerrarModal });
    }
  }

  // Elimina una categoría
  function eliminar(id: number) {
    if (window.confirm("¿Desea eliminar esta categoría?")) {
      eliminarMutacion.mutate(id, { onSuccess: cerrarModal });
    }
  }

  // Define las columnas de la tabla
  const columnas: ColumnDef<Categoria>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: false,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => abrirEditar(row.original)}
            className="mr-4 cursor-pointer text-blue-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() => eliminar(row.original.id)}
            className="cursor-pointer text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  // Configura TanStack Table
  const tabla = useReactTable({
    data: categorias,
    columns: columnas,
    state: {
      sorting: ordenamiento,
      columnVisibility: {
        acciones: esAdmin,
      },
    },
    onSortingChange: setOrdenamiento,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Categorías
          </h1>
          {esAdmin && (
            <button
              onClick={abrirCrear}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Añadir Categoría
            </button>
          )}
        </div>

        {isPending ? (
          <EstadoCarga mensaje="Cargando categorías..." />
        ) : isError ? (
          <EstadoError mensaje="Error al cargar las categorías." />
        ) : (
          <CategoriaList tabla={tabla} />
        )}
      </div>

      {esAdmin && (
        <CategoriaModal
          abierto={modalAbierto}
          categoria={categoriaSeleccionada}
          onCerrar={cerrarModal}
          onGuardar={guardarCategoria}
        />
      )}
    </main>
  );
}
