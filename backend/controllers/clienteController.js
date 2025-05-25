import oracledb from 'oracledb';
// Obtener todos los clientes
async function obtenerClientes(req, res) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`
      SELECT c.ID_CLIENTE, c.DIRECCION_CLIENTE, p.NOMBRE_PERSONA, p.CEDULA_PERSONA, p.TELEFONO_PERSONA
      FROM CLIENTE c
      JOIN PERSONA p ON c.ID_PERSONA = p.ID_PERSONA
    `);
    
    const columns = result.metaData.map(c => c.name);
    const clientes = result.rows.map(row => {
      return columns.reduce((obj, col, index) => {
        obj[col] = row[index];
        return obj;
      }, {});
    });

    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener cliente por ID
async function obtenerClientePorId(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT * FROM CLIENTE WHERE ID_CLIENTE = :id`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const columns = result.metaData.map(c => c.name);
    const cliente = columns.reduce((obj, col, index) => {
      obj[col] = result.rows[0][index];
      return obj;
    }, {});

    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Crear un nuevo cliente
async function crearCliente(req, res) {
  const { id_cliente, direccion_cliente, id_persona } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Verificar si la persona existe
    const check = await connection.execute(
      `SELECT * FROM PERSONA WHERE ID_PERSONA = :id`,
      [id_persona]
    );

    if (check.rows.length === 0) {
      return res.status(400).json({ error: 'La persona no existe' });
    }

    // Insertar el cliente
    await connection.execute(
      `INSERT INTO CLIENTE (ID_CLIENTE, DIRECCION_CLIENTE, ID_PERSONA)
       VALUES (SEQ_CLIENTE.NEXTVAL, :direccion_cliente, :id_persona)`,
      { id_cliente, direccion_cliente, id_persona }
    );

    await connection.commit();

    res.status(201).json({ mensaje: 'Cliente creado exitosamente' });
  } catch (error) {
    if (error.message.includes('ORA-00001')) {
      res.status(409).json({ error: 'El ID_CLIENTE ya existe' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

// Actualizar dirección del cliente
async function actualizarDireccion(req, res) {
  const { id } = req.params;
  const { direccion } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `UPDATE CLIENTE SET DIRECCION_CLIENTE = :direccion WHERE ID_CLIENTE = :id`,
      { direccion, id: parseInt(id) }
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Dirección actualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Eliminar cliente
async function eliminarCliente(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `DELETE FROM CLIENTE WHERE ID_CLIENTE = :id`,
      [parseInt(id)]
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    if (error.message.includes('ORA-02292')) {
      res.status(409).json({ error: 'No se puede eliminar: cliente tiene paquetes asociados' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

export {
  obtenerClientes,
  obtenerClientePorId,
  crearCliente,
  actualizarDireccion,
  eliminarCliente
};
