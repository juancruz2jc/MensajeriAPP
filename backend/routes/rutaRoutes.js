import express from 'express';
import {
  crearRuta,
  obtenerRutas,
  obtenerRutaPorId,
  eliminarRuta,
  marcarRutaCompletada
} from '../controllers/rutaController.js';

const router = express.Router();

router.post('/', crearRuta);
router.get('/', obtenerRutas);
router.get('/:id', obtenerRutaPorId);
router.put('/:id/completar', marcarRutaCompletada);
router.delete('/:id', eliminarRuta);

export default router;
