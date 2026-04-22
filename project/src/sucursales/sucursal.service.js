const { createSucursal } = require('./sucursal.model');
let sucursales = [];

//Validar campos obligatorios
function validar({ nombre, tipo, direccion }) {
  if (!nombre || !tipo || !direccion) {
    const error = new Error('Faltan datos obligatorios');
    error.status = 400;
    throw error;
  }

  if (tipo !== 'sucursal' && tipo !== 'franquicia') {
    const error = new Error('Tipo inválido');
    error.status = 400;
    throw error;
  }
}

//Crear sucursal
function crear(data) {
  validar(data);

  const nueva = createSucursal(data);
  sucursales.push(nueva);

  return nueva;
}
//Listar sucursales
function listar() {
  return sucursales;
}

//Buscar sucursal por ID
function obtenerPorId(id) {
  const sucursal = sucursales.find(s => s.id === id);

  if (!sucursal) {
    const error = new Error('Sucursal no encontrada');
    error.status = 404;
    throw error;
  }

  return sucursal;
}

// Actualizar datos 
function actualizar(id, data) {
  const sucursal = obtenerPorId(id);

  if (data.nombre) sucursal.nombre = data.nombre;
  if (data.tipo) sucursal.tipo = data.tipo;
  if (data.direccion) sucursal.direccion = data.direccion;

  return sucursal;
}

//Desactivar sucursal
function desactivar(id) {
const sucursal = obtenerPorId(id);

  sucursal.activa = false;

  return sucursal;
}

//Ver sucursales activas
function esSucursalActiva(id) {
  const sucursal = sucursales.find(s => s.id === id);
  return sucursal ? sucursal.activa : false;
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  desactivar,
  esSucursalActiva
};
