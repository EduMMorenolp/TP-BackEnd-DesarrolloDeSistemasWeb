const fs = require('fs');
const path = require('path');

const productosPath = path.join(__dirname, 'productos.json');
const pedidosPath = path.join(__dirname, 'pedidos.json');
const sucursalesPath = path.join(__dirname, 'sucursales.json');

function loadOrInit(filePath, key) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ [key]: [] }, null, 2), 'utf-8');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8').trim();
  if (!content) {
    fs.writeFileSync(filePath, JSON.stringify({ [key]: [] }, null, 2), 'utf-8');
    return [];
  }

  const parsed = JSON.parse(content);
  return Array.isArray(parsed[key]) ? parsed[key] : [];
}

const store = {
  productos: loadOrInit(productosPath, 'productos'),
  pedidos: loadOrInit(pedidosPath, 'pedidos'),
  sucursales: loadOrInit(sucursalesPath, 'sucursales')
};

function saveStore() {
  fs.writeFileSync(productosPath, JSON.stringify({ productos: store.productos }, null, 2), 'utf-8');
  fs.writeFileSync(pedidosPath, JSON.stringify({ pedidos: store.pedidos }, null, 2), 'utf-8');
  fs.writeFileSync(sucursalesPath, JSON.stringify({ sucursales: store.sucursales }, null, 2), 'utf-8');
}

module.exports = {
  store,
  saveStore
};
