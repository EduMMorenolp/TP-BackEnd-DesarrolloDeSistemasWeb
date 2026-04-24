const { v4: uuidv4 } = require('uuid');

function createSucursal({ nombre, tipo, direccion }) {
  return {
    id: uuidv4(),
    nombre,
    tipo,
    direccion,
    activa: true,
    fechaCreacion: new Date().toISOString()
  };
}

module.exports = {
  createSucursal
};
