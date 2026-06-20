import mongoose from '../../config/db.js';

const sucursalSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo es obligatorio'],
    enum: {
      values: ['sucursal', 'franquicia'],
      message: 'El tipo debe ser "sucursal" o "franquicia"'
    }
  },
  direccion: {
    type: String,
    required: [true, 'La direccion es obligatoria']
  },
  activa: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  // --- Trazabilidad ---
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  deactivatedAt: {
    type: Date
  }
});

const Sucursal = mongoose.model('Sucursal', sucursalSchema);

export default Sucursal;
