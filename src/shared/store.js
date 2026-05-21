import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pedidosPath = path.join(__dirname, 'pedidos.json');

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
  pedidos: loadOrInit(pedidosPath, 'pedidos')
};

function saveStore() {
  fs.writeFileSync(pedidosPath, JSON.stringify({ pedidos: store.pedidos }, null, 2), 'utf-8');
}

export { store, saveStore };
