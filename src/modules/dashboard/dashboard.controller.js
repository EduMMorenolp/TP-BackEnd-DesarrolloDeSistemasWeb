import * as dashboardService from './dashboard.service.js';

export async function obtenerDashboard(req, res, next) {
    try {
        const data = await dashboardService.obtenerDashboard(req.user);
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}