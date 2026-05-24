/**
 * Middleware de autorización basado en roles y propiedad de recursos.
 * - `permit(roles)` permite el acceso si el `req.user.rol` está en `roles` o es `ADMIN`.
 * - `permitOwnerOr(roles, resourceModel, resourceIdParam='id', ownerField='sucursalId')`
 *    permite acceso si ADMIN, si el rol está en `roles`, o si el recurso pertenece al usuario.
 */
import mongoose from 'mongoose';

export const permit = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (req.user.rol === 'ADMIN') return next();
    if (roles.includes(req.user.rol)) return next();
    return res.status(403).json({ message: 'Acceso denegado' });
  };
};

// resourceModel: Mongoose model (o string con nombre del modelo)
export const permitOwnerOr = (roles = [], resourceModel, resourceIdParam = 'id', ownerField = 'sucursalId') => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (req.user.rol === 'ADMIN') return next();
    if (roles.includes(req.user.rol)) return next();

    try {
      let Model = resourceModel;
      // permitir pasar el nombre del modelo como string
      if (typeof resourceModel === 'string') {
        Model = mongoose.model(resourceModel);
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) return res.status(400).json({ message: 'Falta id de recurso en params' });

      const resource = await Model.findById(resourceId).lean();
      if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });

      // Si el recurso no tiene el campo ownerField, permitimos comparar con su propio _id
      const owner = resource[ownerField] || resource._id;

      if (!owner) return res.status(403).json({ message: 'Recurso sin campo propietario' });

      if (String(owner) === String(req.user.sucursalId || req.user.id)) {
        return next();
      }

      return res.status(403).json({ message: 'Acceso denegado: no es propietario del recurso' });
    } catch (err) {
      return res.status(500).json({ message: 'Error en autorización', error: err.message });
    }
  };
};
