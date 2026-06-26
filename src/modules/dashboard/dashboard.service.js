import * as pedidoService from '../pedidos/pedido.service.js';
import * as sucursalService from '../sucursales/sucursal.service.js';

export async function obtenerDashboard(user) {

    const [pedidos, sucursales] = await Promise.all([
        pedidoService.listar(),
        sucursalService.listar(user)
    ]);

    // Filtrar pedidos según el scope del usuario (SUCURSAL/FRANQUICIA solo ven los suyos)
    const pedidosFiltrados = (user && (user.rol === 'SUCURSAL' || user.rol === 'FRANQUICIA'))
        ? pedidos.filter(p => String(p.sucursal?._id || p.sucursalId) === String(user.sucursalId))
        : pedidos;

    const pendientes = pedidosFiltrados.filter(p => p.estado === 'pendiente').length;
    const enCurso = pedidosFiltrados.filter(p => p.estado === 'en_produccion').length;
    const entregados = pedidosFiltrados.filter(p => p.estado === 'entregado').length;

    const ultimosPedidos = [...pedidosFiltrados]
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