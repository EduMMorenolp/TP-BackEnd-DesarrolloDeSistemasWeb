import mongoose from '../../config/db.js';

const productoSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio'],
  },
  descripcion: { 
    type: String, 
    default: '' 
  },
  precio: { 
    type: Number, 
    required: [true, 'El precio es obligatorio'],
    min: [0.01, 'El precio debe ser mayor a 0'] 
  },
  categoria: { 
    type: String, 
    required: [true, 'La categoría es obligatoria'],
  },
  disponible: { 
    type: Boolean, 
    default: true 
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  }, 
});


const Producto = mongoose.model('Producto', productoSchema);

export default Producto;