import express from 'express';
import oracledb from 'oracledb';
import {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarDireccion,
  eliminarCliente
} from '../controllers/clienteController.js';

import { verificarToken, soloAdmin } from '../middleware/authmiddleware.js';

const router = express.Router();

router.get('/', verificarToken, soloAdmin, obtenerClientes);
router.get('/:id', verificarToken, obtenerClientePorId);
router.post('/', verificarToken, crearCliente);
router.put('/:id/direccion', verificarToken, actualizarDireccion);
router.delete('/:id', verificarToken, eliminarCliente); 


export default router;
