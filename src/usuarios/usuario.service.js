import Usuario from './usuario.model.js';

export const getUsuarios = async (filter = {}) => {
  return await Usuario.find(filter).populate('sucursalId', 'nombre');
};

export const getUsuarioById = async (id) => {
  return await Usuario.findById(id).populate('sucursalId', 'nombre');
};

export const getUsuarioByEmail = async (email) => {
  return await Usuario.findOne({ email });
};

export const createUsuario = async (data) => {
  const usuario = new Usuario(data);
  return await usuario.save();
};

export const updateUsuario = async (id, data) => {
  // Si envían password nuevo, necesitamos usar save() para que corra el hook de pre-save
  // O podemos hashearla acá. Vamos a usar Mongoose findByIdAndUpdate pero si hay password, lo manejamos.
  if (data.password) {
    const usuario = await Usuario.findById(id);
    if (!usuario) return null;
    
    Object.assign(usuario, data);
    return await usuario.save();
  }

  return await Usuario.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).populate('sucursalId', 'nombre');
};

export const deleteUsuario = async (id) => {
  // En lugar de borrar, hacemos borrado lógico
  return await Usuario.findByIdAndUpdate(
    id, 
    { activo: false }, 
    { new: true }
  );
};
