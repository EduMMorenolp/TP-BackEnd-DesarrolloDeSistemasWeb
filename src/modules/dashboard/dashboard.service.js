import * as pedidoService from '../pedidos/pedido.service.js';
import * as sucursalService from '../sucursales/sucursal.service.js';

export async function obtenerDashboard() {

    const pedidos = await pedidoService.listar();
    const sucursales = await sucursalService.listar();

    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const enCurso = pedidos.filter(p => p.estado === 'en_produccion').length;
    const entregados = pedidos.filter(p => p.estado === 'entregado').length;

    const ultimosPedidos = [...pedidos]
        .sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
        .slice(0, 5);

    return {
        kpis: {
            pendientes,
            enCurso,
            entregados
        },
        ultimosPedidos,
        sucursales
    };
}