import { ok } from 'assert';

const API_BASE = 'http://localhost:3000/api';

async function fetchJson(url, options) {
    const res = await fetch(url, options);
    const body = await res.text();
    let json = {};
    try { if (body) json = JSON.parse(body); } catch (e) {}
    return { status: res.status, ok: res.ok, body: json };
}

async function runTests() {
    console.log("Starting tests...");
    
    // Setup: Get valid sucursal and producto
    const resSuc = await fetchJson(`${API_BASE}/sucursales`);
    const validSucursal = resSuc.body.find(s => s.activa);
    
    // Create an inactive sucursal for test
    const inactiveSucursalRes = await fetchJson(`${API_BASE}/sucursales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: "Inactiva Test", tipo: "sucursal", direccion: "Fake", activa: false })
    });
    const inactiveSucursalId = inactiveSucursalRes.body._id;
    
    const resProd = await fetchJson(`${API_BASE}/productos`);
    const validProducto = resProd.body[0];
    const validProductoId = validProducto._id;
    
    let createdPedidoId = null;
    
    // Test 1: POST /api/pedidos crea un pedido contra MongoDB con sucursalId y productos validos
    try {
        const payload = {
            sucursalId: validSucursal._id,
            productos: [ { productoId: validProductoId, cantidad: 2 } ]
        };
        const res = await fetchJson(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.status === 201 && res.body.sucursalId === validSucursal._id) {
            console.log("PASS: 1. POST /api/pedidos crea un pedido contra MongoDB con sucursalId y productos validos");
            createdPedidoId = res.body.id || res.body._id;
        } else {
            console.log("FAIL: 1. POST /api/pedidos crea un pedido... Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 1. " + e.message);
    }

    // Test 2: POST /api/pedidos rechaza sucursal inactiva (error)
    try {
        const payload = {
            sucursalId: inactiveSucursalId,
            productos: [ { productoId: validProductoId, cantidad: 2 } ]
        };
        const res = await fetchJson(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.status >= 400) {
            console.log("PASS: 2. POST /api/pedidos rechaza sucursal inactiva (error)");
        } else {
            console.log("FAIL: 2. POST /api/pedidos rechaza sucursal inactiva (error). Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 2. " + e.message);
    }
    
    // Test 3: POST /api/pedidos rechaza productos inexistentes (error)
    try {
        const payload = {
            sucursalId: validSucursal._id,
            productos: [ { productoId: "6a05e8656eaaeff8b2f03d99", cantidad: 2 } ]
        };
        const res = await fetchJson(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.status >= 400) {
            console.log("PASS: 3. POST /api/pedidos rechaza productos inexistentes (error)");
        } else {
            console.log("FAIL: 3. POST /api/pedidos rechaza productos inexistentes (error). Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 3. " + e.message);
    }

    // Test 4: GET /api/pedidos lista pedidos con datos poblados de sucursal y productos
    try {
        const res = await fetchJson(`${API_BASE}/pedidos`);
        if (res.status === 200 && Array.isArray(res.body) && res.body.length > 0) {
            const first = res.body.find(p => (p.id || p._id) === createdPedidoId);
            if (first && first.sucursal && first.sucursal.nombre && first.productos && first.productos[0].nombre) {
                console.log("PASS: 4. GET /api/pedidos lista pedidos con datos poblados de sucursal y productos");
            } else {
                console.log("FAIL: 4. Data not fully populated: ", JSON.stringify(first));
            }
        } else {
            console.log("FAIL: 4. GET /api/pedidos lista pedidos con datos poblados. Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 4. " + e.message);
    }
    
    // Test 5: GET /api/pedidos/:id devuelve pedido individual con populate
    try {
        const res = await fetchJson(`${API_BASE}/pedidos/${createdPedidoId}`);
        if (res.status === 200 && res.body.sucursal && res.body.sucursal.nombre && res.body.productos[0].nombre) {
            console.log("PASS: 5. GET /api/pedidos/:id devuelve pedido individual con populate");
        } else {
            console.log("FAIL: 5. GET /api/pedidos/:id devuelve pedido individual con populate. Output: ", JSON.stringify(res.body));
        }
    } catch (e) {
        console.log("FAIL: 5. " + e.message);
    }
    
    // Test 6: PATCH /api/pedidos/:id/estado respeta la maquina de estados (pendiente -> en_produccion)
    try {
        const res = await fetchJson(`${API_BASE}/pedidos/${createdPedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'en_produccion' })
        });
        if (res.status === 200 && res.body.estado === 'en_produccion') {
            console.log("PASS: 6. PATCH /api/pedidos/:id/estado respeta la maquina de estados");
        } else {
            console.log("FAIL: 6. PATCH /api/pedidos/:id/estado respeta la maquina de estados. Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 6. " + e.message);
    }

    // Test 7: PATCH /api/pedidos/:id/estado rechaza transiciones invalidas (400) (en_produccion -> entregado without despachado)
    try {
        const res = await fetchJson(`${API_BASE}/pedidos/${createdPedidoId}/estado`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'entregado' })
        });
        if (res.status === 400) {
            console.log("PASS: 7. PATCH /api/pedidos/:id/estado rechaza transiciones invalidas (400)");
        } else {
            console.log("FAIL: 7. PATCH /api/pedidos/:id/estado rechaza transiciones invalidas (400). Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 7. " + e.message);
    }

    // Test 8 & 9: DELETE /api/pedidos/:id
    // Wait, first let's test 9 since our createdPedidoId is now "en_produccion" (not pendiente)
    // DELETE /api/pedidos/:id rechaza cancelacion de pedido no pendiente (409)
    try {
        const res = await fetchJson(`${API_BASE}/pedidos/${createdPedidoId}`, { method: 'DELETE' });
        if (res.status === 409) {
            console.log("PASS: 9. DELETE /api/pedidos/:id rechaza cancelacion de pedido no pendiente (409)");
        } else {
            console.log("FAIL: 9. DELETE /api/pedidos/:id rechaza cancelacion de pedido no pendiente (409). Status: " + res.status);
        }
    } catch (e) {
        console.log("FAIL: 9. " + e.message);
    }

    // Now test 8: create a new one, state is "pendiente", then DELETE it
    try {
        const payload = {
            sucursalId: validSucursal._id,
            productos: [ { productoId: validProductoId, cantidad: 1 } ]
        };
        const pRes = await fetchJson(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const pId = pRes.body.id || pRes.body._id;
        
        const dRes = await fetchJson(`${API_BASE}/pedidos/${pId}`, { method: 'DELETE' });
        if (dRes.status === 200) {
            console.log("PASS: 8. DELETE /api/pedidos/:id cancela pedido en estado pendiente");
        } else {
            console.log("FAIL: 8. DELETE /api/pedidos/:id cancela pedido en estado pendiente. Status: " + dRes.status);
        }
    } catch (e) {
        console.log("FAIL: 8. " + e.message);
    }
}

runTests();
