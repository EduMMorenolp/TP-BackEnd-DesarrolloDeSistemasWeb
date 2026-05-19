import { v4 as uuid } from 'uuid';

const createProducto = ({ nombre, descripcion, precio, categoria }) => {
  const nuevoProducto = {
    id: uuid(),
    nombre,
    descripcion,
    precio,
    categoria,
    disponible: true,
    fechaCreacion: new Date().toISOString()
  };

  return nuevoProducto;
};

export { createProducto };
