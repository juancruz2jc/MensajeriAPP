import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initialize } from './config/database.js';
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rutas
import paqueteRoutes from './routes/paqueteRoutes.js';
app.use('/api/paquetes', paqueteRoutes);

import clienteRoutes from './routes/clienteRoutes.js';
app.use('/api/clientes', clienteRoutes);

import personaRoutes from './routes/personaRoutes.js';
app.use('/api/personas', personaRoutes);

import facturaRoutes from './routes/facturaRoutes.js';
app.use('/api/facturas', facturaRoutes);

import rutaRoutes from './routes/rutaRoutes.js';
app.use('/api/rutas', rutaRoutes);

import centroRoutes from './routes/centroRoutes.js';
app.use('/api/centros', centroRoutes);

import authRoutes from './routes/authRoutes.js';
app.use('/api/auth', authRoutes);

// Iniciar servidor y conexión a la DB
const PORT = process.env.PORT || 3000;
initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });
});