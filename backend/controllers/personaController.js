import oracledb from 'oracledb';

// Obtener todas las personas
async function obtenerPersonas(req, res) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`SELECT * FROM PERSONA`);

    const columns = result.metaData.map(c => c.name);
    const personas = result.rows.map(row => {
      return columns.reduce((obj, col, index) => {
        obj[col] = row[index];
        return obj;
      }, {});
    });

    res.status(200).json(personas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener persona por ID
async function obtenerPersonaPorId(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT * FROM PERSONA WHERE ID_PERSONA = :id`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Persona no encontrada' });
    }

    const columns = result.metaData.map(c => c.name);
    const persona = columns.reduce((obj, col, index) => {
      obj[col] = result.rows[0][index];
      return obj;
    }, {});

    res.status(200).json(persona);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Crear una nueva persona
async function crearPersona(req, res) {
  const { id_persona, nombre_persona, cedula_persona, telefono_persona, edad, sexo } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `INSERT INTO PERSONA (ID_PERSONA, NOMBRE_PERSONA, CEDULA_PERSONA, TELEFONO_PERSONA, EDAD, SEXO)
       VALUES (SEQ_PERSONA.NEXTVAL, :nombre_persona, :cedula_persona, :telefono_persona, :edad, :sexo)`,
      { id_persona, nombre_persona, cedula_persona, telefono_persona, edad, sexo }
    );

    await connection.commit();

    res.status(201).json({ mensaje: 'Persona creada exitosamente' });
  } catch (error) {
    if (error.message.includes('ORA-00001')) {
      res.status(409).json({ error: 'ID_PERSONA o CEDULA ya existen' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

// Actualizar datos básicos de una persona
async function actualizarPersona(req, res) {
  const { id } = req.params;
  const { nombre_persona, telefono_persona, edad } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `UPDATE PERSONA
       SET NOMBRE_PERSONA = :nombre_persona,
           TELEFONO_PERSONA = :telefono_persona,
           EDAD = :edad
       WHERE ID_PERSONA = :id`,
      { nombre_persona, telefono_persona, edad, id: parseInt(id) }
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Persona no encontrada' });
    }

    res.status(200).json({ mensaje: 'Persona actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Eliminar persona
async function eliminarPersona(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `DELETE FROM PERSONA WHERE ID_PERSONA = :id`,
      [parseInt(id)]
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Persona no encontrada' });
    }

    res.status(200).json({ mensaje: 'Persona eliminada correctamente' });
  } catch (error) {
    if (error.message.includes('ORA-02292')) {
      res.status(409).json({ error: 'No se puede eliminar: la persona está asociada a un cliente o empleado' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

export {
  obtenerPersonas,
  obtenerPersonaPorId,
  crearPersona,
  actualizarPersona,
  eliminarPersona
};  
