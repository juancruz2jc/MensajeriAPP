import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).json({ mensaje: 'Token requerido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token inválido' });
    }
}

// Middleware para permitir solo a administradores
export function soloAdmin(req, res, next) {
    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ mensaje: 'Acceso solo para administradores' });
    }
    next();
}

// Middleware para permitir solo a clientes
export function soloCliente(req, res, next) {
    if (req.usuario.rol !== 'cliente') {
        return res.status(403).json({ mensaje: 'Acceso solo para clientes' });
    }
    next();
}

// Middleware para permitir solo a empleados
export function soloEmpleado(req, res, next) {
    if (req.usuario.rol !== 'empleado') {
        return res.status(403).json({ mensaje: 'Acceso solo para empleados' });
    }
    next();
}

// Middleware genérico para múltiples roles
export function permitirRoles(...rolesPermitidos) {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ mensaje: 'Acceso denegado: rol no autorizado' });
        }
        next();
    };
}