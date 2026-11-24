interface EstadoProps {
  mensaje: string;
}

// Muestra un mensaje mientras se cargan los datos
export function EstadoCarga({ mensaje }: EstadoProps) {
  return (
    <div
      role="status"
      className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500"
    >
      {mensaje}
    </div>
  );
}

// Muestra un mensaje cuando ocurre un error
export function EstadoError({ mensaje }: EstadoProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-white p-6 text-center text-sm text-red-600"
    >
      {mensaje}
    </div>
  );
}

// Muestra un mensaje cuando no hay registros
export function EstadoVacio({ mensaje }: EstadoProps) {
  return <div className="p-6 text-center text-sm text-gray-500">{mensaje}</div>;
}
