//Función para crear un producto con sus campos requeridos.
// 
const { v4: uuid } = require('uuid');

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
}

module.exports = { createProducto };