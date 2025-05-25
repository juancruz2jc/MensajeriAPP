import express from 'express';
import {
  crearFactura,
  pagarFactura,
  obtenerFacturaPorId,
  obtenerFacturas,
  eliminarFactura
} from '../controllers/facturaController.js';

const router = express.Router();

router.post('/', crearFactura);
router.put('/:id/pagar', pagarFactura);
router.get('/:id', obtenerFacturaPorId);
router.get('/', obtenerFacturas);
router.delete('/:id', eliminarFactura);

export default router;
