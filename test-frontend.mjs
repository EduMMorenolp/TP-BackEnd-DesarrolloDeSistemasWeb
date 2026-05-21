async function checkUrl(url) {
    try {
        const res = await fetch(url);
        console.log(`${url}: ${res.status}`);
    } catch (e) {
        console.log(`${url}: Error ${e.message}`);
    }
}
async function run() {
    await checkUrl("http://localhost:3000/pedidos");
    await checkUrl("http://localhost:3000/sucursales");
    await checkUrl("http://localhost:3000/productos");
}
run();
