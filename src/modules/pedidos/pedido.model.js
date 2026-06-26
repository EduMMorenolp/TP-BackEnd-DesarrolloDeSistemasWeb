import mongoose from '../../config/db.js';

// Schema para los items dentro de un pedido.
const itemPedidoSchema = new mongoose.Schema({
  productoId: {
    type: String,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
  },
  // Desnormalizamos nombre y precio para mantener un registro histórico del pedido,
  // incluso si el producto original cambia sus valores.
  nombre: {
    type: String,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
}, { _id: false }); // No se necesitan IDs para estos subdocumentos.

const historialEstadoSchema = new mongoose.Schema({
  estado: { type: String, required: true },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  sucursalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sucursal',
    required: [true, 'El ID de la sucursal es obligatorio'],
  },
  productos: {
    type: [itemPedidoSchema],
    required: true,
    // Valida que el array de productos no esté vacío.
    validate: [v => Array.isArray(v) && v.length > 0, 'El pedido debe tener al menos un producto'],
  },
  estado: {
    type: String,
    required: true,
    enum: {
      values: ['pendiente', 'en_produccion', 'despachado', 'entregado'],
      message: 'El estado proporcionado no es válido',
    },
    default: 'pendiente',
  },
  observaciones: {
    type: String,
    default: '',
  },
  precioTotal: {
    type: Number,
    required: true,
    min: [0, 'El precio total no puede ser negativo'],
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  historialEstados: {
    type: [historialEstadoSchema],
  },
}, {
  // Mongoose manejará createdAt y updatedAt, que mapeamos a nuestros campos existentes.
  timestamps: {
    createdAt: 'fechaPedido',
    updatedAt: 'fechaActualizacion',
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Creamos un campo virtual 'id' para mantener compatibilidad con el frontend
// y las respuestas de la API que esperan 'id' en lugar de '_id'.
pedidoSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

export default Pedido;
