import express from 'express';
import {
    obtenerCentros,
    obtenerCentroPorId,
    crearCentro,
    actualizarCentro,
    eliminarCentro
} from '../controllers/centroController.js';

const router = express.Router();

router.get('/', obtenerCentros);
router.get('/:id', obtenerCentroPorId);
router.post('/', crearCentro);
router.put('/:id', actualizarCentro);
router.delete('/:id', eliminarCentro);

export default router;
