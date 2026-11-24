import { useAuthStore } from "@/features/auth";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";

import type { Producto } from "../types/producto";
import type { ProductoRequest } from "../services/producto";

import ProductoList from "../components/ProductoList";
import ProductoModal from "../components/ProductoModal";
import { useProducts } from "../hooks/useProducts";

export default function ProductoPage() {
  const esAdmin = useAuthStore((state) => state.usuario?.role === "admin");

  const [paginacion, setPaginacion] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [ordenamiento, setOrdenamiento] = useState<SortingState>([]);

  // Solicita al backend solamente los productos de la pagina actual

  const {
    productos,
    isPending,
    isError,
    crearMutacion,
    actualizarMutacion,
    eliminarMutacion,
  } = useProducts({
    // Solicita hasta 100 productos para paginarlos desde React
    skip: 0,
    limit: 100,
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);

  // Abre el modal para crear
  function abrirCrear() {
    setProductoSeleccionado(null);
    setModalAbierto(true);
  }

  // Abre el modal para editar
  function abrirEditar(producto: Producto) {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  }

  // Cierra el modal
  function cerrarModal() {
    setModalAbierto(false);
    setProductoSeleccionado(null);
  }

  // Guarda un producto
  function guardarProducto(datos: ProductoRequest) {
    if (productoSeleccionado) {
      actualizarMutacion.mutate(
        {
          id: productoSeleccionado.id,
          datos,
        },
        { onSuccess: cerrarModal },
      );
    } else {
      crearMutacion.mutate(datos, { onSuccess: cerrarModal });
    }
  }

  // Elimina un producto
  function eliminar(id: number) {
    if (window.confirm("¿Desea eliminar este producto?")) {
      eliminarMutacion.mutate(id);
    }
  }

  // Define las columnas de la tabla
  const columnas: ColumnDef<Producto>[] = [
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
      accessorKey: "precio_base",
      header: "Precio",
      cell: ({ getValue }) =>
        getValue<number>().toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
        }),
    },
    {
      accessorKey: "stock",
      header: "Stock",
    },
    {
      accessorKey: "disponible",
      header: "Disponible",
      cell: ({ getValue }) => (getValue<boolean>() ? "Sí" : "No"),
    },
    {
      id: "categoria",
      header: "Categoría",
      accessorFn: (producto) => producto.categoria.nombre,
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => abrirEditar(row.original)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => eliminar(row.original.id)}
            className="cursor-pointer text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ];

  // Configura TanStack Table con paginacion del lado del cliente
  const tabla = useReactTable({
    data: productos,
    columns: columnas,
    state: {
      sorting: ordenamiento,
      pagination: paginacion,
      columnVisibility: {
        acciones: esAdmin,
      },
    },
    onSortingChange: setOrdenamiento,
    onPaginationChange: setPaginacion,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 dark:bg-slate-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Productos
          </h1>

          {esAdmin && (
            <button
              type="button"
              onClick={abrirCrear}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Añadir Producto
            </button>
          )}
        </div>

        {isPending ? (
          <EstadoCarga mensaje="Cargando productos..." />
        ) : isError ? (
          <EstadoError mensaje="Error al cargar los productos." />
        ) : (
          <ProductoList tabla={tabla} />
        )}
      </div>

      {esAdmin && (
        <ProductoModal
          abierto={modalAbierto}
          producto={productoSeleccionado}
          onCerrar={cerrarModal}
          onGuardar={guardarProducto}
        />
      )}
    </main>
  );
}
