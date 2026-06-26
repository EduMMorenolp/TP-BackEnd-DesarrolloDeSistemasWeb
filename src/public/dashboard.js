document.addEventListener('DOMContentLoaded', async () => {

    try {

        const res = await fetch('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!res.ok) {
            throw new Error('No se pudieron obtener los datos del dashboard');
        }

        const data = await res.json();

   
        document.getElementById('kpiPendientes').textContent =
            data.kpis.pendientes;

        document.getElementById('kpiEnCurso').textContent =
            data.kpis.enCurso;

        document.getElementById('kpiEntregados').textContent =
            data.kpis.entregados;


        const tablaPedidos = document.getElementById('ultimosPedidos');
        tablaPedidos.innerHTML = '';

        data.ultimosPedidos.forEach(pedido => {

            tablaPedidos.innerHTML += `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${pedido.sucursal?.nombre ?? '-'}</td>
                    <td>${pedido.estado}</td>
                    <td>${new Date(pedido.fechaPedido).toLocaleDateString()}</td>
                </tr>
            `;

        });

        const tablaSucursales = document.getElementById('estadoSucursales');
        tablaSucursales.innerHTML = '';

        data.sucursales.forEach(sucursal => {

            tablaSucursales.innerHTML += `
                <tr>
                    <td>${sucursal.nombre}</td>
                    <td>${sucursal.tipo}</td>
                    <td>${sucursal.activa ? 'Activa' : 'Inactiva'}</td>
                </tr>
            `;

        });

    }
    catch (error) {

        console.error(error);

    }

});