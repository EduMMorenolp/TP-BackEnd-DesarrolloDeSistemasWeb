import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'El email no es válido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  rol: {
    type: String,
    enum: ['ADMIN', 'PLANTA', 'SUCURSAL', 'FRANQUICIA'],
    default: 'SUCURSAL',
    required: true
  },
  sucursalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sucursal',
    required: function() {
      // Es obligatoria si el rol es SUCURSAL o FRANQUICIA
      return this.rol === 'SUCURSAL' || this.rol === 'FRANQUICIA';
    }
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Middleware pre-save para encriptar la contraseña antes de guardarla
usuarioSchema.pre('save', async function() {
  // Solo hashear la contraseña si ha sido modificada (o es nueva)
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Método para verificar contraseña
usuarioSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sobrescribir toJSON para no devolver la contraseña en las respuestas
usuarioSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;
