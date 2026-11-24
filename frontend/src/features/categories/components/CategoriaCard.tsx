import type { Categoria } from "../types/categoria";

interface CategoriaCardProps {
  categoria: Categoria;
  onEditar: (categoria: Categoria) => void;
  onEliminar: (id: number) => void;
}

export default function CategoriaCard({
  categoria,
  onEditar,
  onEliminar,
}: CategoriaCardProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3">{categoria.id}</td>
      <td className="px-4 py-3">{categoria.nombre}</td>
      <td className="px-4 py-3">{categoria.descripcion}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEditar(categoria)}
          className="mr-4 cursor-pointer text-blue-600 hover:underline"
        >
          Editar
        </button>
        <button
          onClick={() => onEliminar(categoria.id)}
          className="cursor-pointer text-red-600 hover:underline"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
}
