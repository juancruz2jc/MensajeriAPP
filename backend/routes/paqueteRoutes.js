import express from 'express';
import oracledb from 'oracledb';
import { 
  crearPaquete, 
  actualizarEstadoPaquete,
  obtenerPaquetes,
  obtenerPaquetePorId, 
  eliminarPaquete,
  actualizarPaqueteCompleto
} from '../controllers/paqueteController.js';

const router = express.Router();

router.post('/', crearPaquete);
router.put('/:id/estado', actualizarEstadoPaquete);
router.get('/', obtenerPaquetes);       
router.get('/:id', obtenerPaquetePorId); 
router.delete('/:id', eliminarPaquete);
router.put('/:id', actualizarPaqueteCompleto);

export default router;
