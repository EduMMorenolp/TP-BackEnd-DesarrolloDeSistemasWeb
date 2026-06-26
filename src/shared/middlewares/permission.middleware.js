/**
 * Middlewares de autorización basados en roles y propiedad de recursos.
 *
 * - `permit(roles)`: pasa si el rol está en `roles` o es ADMIN.
 *
 * - `permitOwnerOr(globalRoles, ownerRoles, resourceModel, resourceIdParam, ownerField)`:
 *    - ADMIN pasa siempre.
 *    - Roles en `globalRoles` (ej: PLANTA) pasan sin verificar propiedad
 *      -> administran todos los recursos de ese tipo.
 *    - Roles en `ownerRoles` (ej: FRANQUICIA) pasan SOLO si el recurso les pertenece
 *      (compara resource[ownerField] con req.user.sucursalId).
 *    - Cualquier otro rol recibe 403.
 *
 *    Esto resuelve el bug anterior donde todos los roles listados pasaban directo
 *    y la verificación de propiedad era decorativa.
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

// globalRoles: pasan sin verificar propiedad (ej: PLANTA administra todas las sucursales)
// ownerRoles:  pasan solo si son propietarios del recurso (ej: FRANQUICIA solo la suya)
// resourceModel: Mongoose model o string con nombre del modelo
export const permitOwnerOr = (
  globalRoles = [],
  ownerRoles = [],
  resourceModel,
  resourceIdParam = 'id',
  ownerField = 'sucursalId'
) => {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No autenticado' });
    if (req.user.rol === 'ADMIN') return next();
    if (globalRoles.includes(req.user.rol)) return next();
    if (!ownerRoles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    try {
      let Model = resourceModel;
      if (typeof resourceModel === 'string') {
        Model = mongoose.model(resourceModel);
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) return res.status(400).json({ message: 'Falta id de recurso en params' });

      const resource = await Model.findById(resourceId).lean();
      if (!resource) return res.status(404).json({ message: 'Recurso no encontrado' });

      // Si el recurso no tiene el campo ownerField, comparamos con su propio _id
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
