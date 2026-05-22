import Usuario from '../modules/usuarios/usuario.model.js';
import Sucursal from '../modules/sucursales/sucursal.model.js';
import Producto from '../modules/productos/producto.model.js';
import mongoose from 'mongoose';
import { connectDB } from './db.js';

export const seedDatabase = async () => {
  try {
    // 1. Seed Sucursales
    let sucursalCentral = await Sucursal.findOne({ nombre: 'Sucursal Central (Seed)' });
    let franquiciaDemo = await Sucursal.findOne({ nombre: 'Franquicia Demo (Seed)' });

    if (!sucursalCentral) {
      sucursalCentral = await Sucursal.create({
        nombre: 'Sucursal Central (Seed)',
        tipo: 'sucursal',
        direccion: 'Calle Falsa 123'
      });
      console.log('🌱 Sucursal Central creada por el seeder');
    }

    if (!franquiciaDemo) {
      franquiciaDemo = await Sucursal.create({
        nombre: 'Franquicia Demo (Seed)',
        tipo: 'franquicia',
        direccion: 'Avenida Siempreviva 742'
      });
      console.log('🌱 Franquicia Demo creada por el seeder');
    }

    // 2. Seed Usuarios
    const userCount = await Usuario.countDocuments();
    if (userCount === 0) {
      await Usuario.create([
        {
          nombre: 'Administrador General',
          email: 'admin@laespiga.com',
          password: 'password123',
          rol: 'ADMIN'
        },
        {
          nombre: 'Jefe de Planta',
          email: 'planta@laespiga.com',
          password: 'password123',
          rol: 'PLANTA'
        },
        {
          nombre: 'Encargado Sucursal Central',
          email: 'sucursal@laespiga.com',
          password: 'password123',
          rol: 'SUCURSAL',
          sucursalId: sucursalCentral._id
        },
        {
          nombre: 'Dueño Franquicia Demo',
          email: 'franquicia@laespiga.com',
          password: 'password123',
          rol: 'FRANQUICIA',
          sucursalId: franquiciaDemo._id
        }
      ]);
      console.log('🌱 Usuarios base creados exitosamente \n ADMIN: admin@laespiga.com \n PLANTA: planta@laespiga.com \n SUCURSAL: sucursal@laespiga.com \n FRANQUICIA: franquicia@laespiga.com \n (Contraseña: password123)');
    }



    //3. Seed Productos
    const productCount = await Producto.countDocuments();
    
    if (productCount === 0) {
      await Producto.create([
        {
          nombre: 'Pan de Campo',
          descripcion: 'Pan artesanal horneado a leña',
          precio: 1500,
          categoria: 'Panadería',
        },
        {
          nombre: 'Factura con Crema',
          descripcion: 'Deliciosa factura con crema pastelera',
          precio: 600,
          categoria: 'Facturería',
        },
        {
          nombre: 'Mignon',
          descripcion: 'Pan mignon clásico',
          precio: 2000, // Precio por kilo
          categoria: 'Panadería',
        },
        {
          nombre: 'Pepas de Membrillo',
          descripcion: 'Galletitas artesanales con dulce de membrillo',
          precio: 1200,
          categoria: 'Pastelería',
        }
      ]);
      console.log('🌱 Productos iniciales creados exitosamente');
    } else {
      console.log('ℹ️ Los productos ya existen, saltando seed de productos');
    }


  } catch (error) {
    console.error('❌ Error ejecutando el seeder:', error.message);
  }
};

// Ejecución standalone: node --env-file=.env src/config/seed.js
import { fileURLToPath } from 'url';

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  await connectDB();
  await seedDatabase();
  await mongoose.disconnect();
  console.log('✅ Seed completado. DB desconectada.');
  process.exit(0);
}
