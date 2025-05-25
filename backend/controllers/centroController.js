import oracledb from 'oracledb';

// Obtener todos los centros de distribución
async function obtenerCentros(req, res) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT ID_CENTRO_DISTRIBUCION, UBICACION_CEN_DIST, CAPACIDAD_ALMACENAMIENTO 
       FROM CENTRO_DISTRIBUCION`
    );

    const centros = result.rows.map(row => ({
      id_centro: row[0],
      ubicacion: row[1],
      capacidad: row[2]
    }));

    res.status(200).json(centros);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener un centro por ID
async function obtenerCentroPorId(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    const result = await connection.execute(
      `SELECT ID_CENTRO_DISTRIBUCION, UBICACION_CEN_DIST, CAPACIDAD_ALMACENAMIENTO 
       FROM CENTRO_DISTRIBUCION 
       WHERE ID_CENTRO_DISTRIBUCION = :id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Centro no encontrado' });
    }

    const centro = {
      id_centro: result.rows[0][0],
      ubicacion: result.rows[0][1],
      capacidad: result.rows[0][2]
    };

    res.status(200).json(centro);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Crear un nuevo centro
async function crearCentro(req, res) {
  const { ubicacion, capacidad } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Usamos el paquete pkg_centro_dist para crear el centro
    const result = await connection.execute(
      `BEGIN 
         :id := pkg_centro_dist.crear_centro(
           p_ubicacion => :ubicacion,
           p_capacidad => :capacidad
         );
       END;`,
      {
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        ubicacion: ubicacion,
        capacidad: capacidad
      }
    );

    await connection.commit();

    res.status(201).json({ 
      mensaje: 'Centro creado exitosamente',
      id_centro: result.outBinds.id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Actualizar un centro
async function actualizarCentro(req, res) {
  const { id } = req.params;
  const { ubicacion, capacidad } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Usamos el paquete pkg_centro_dist para actualizar
    const result = await connection.execute(
      `BEGIN 
         :resultado := pkg_centro_dist.actualizar_capacidad(
           p_id_centro => :id,
           p_nueva_cap => :capacidad
         );
       END;`,
      {
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        id: id,
        capacidad: capacidad
      }
    );

    await connection.commit();

    // Si también se actualiza la ubicación
    if (ubicacion) {
      await connection.execute(
        `UPDATE CENTRO_DISTRIBUCION 
         SET UBICACION_CEN_DIST = :ubicacion 
         WHERE ID_CENTRO_DISTRIBUCION = :id`,
        { ubicacion, id }
      );
      await connection.commit();
    }

    res.status(200).json({ 
      mensaje: 'Centro actualizado exitosamente',
      detalle: result.outBinds.resultado 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Eliminar un centro
async function eliminarCentro(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    // Usamos el paquete pkg_centro_dist para eliminar
    const result = await connection.execute(
      `BEGIN 
         :resultado := pkg_centro_dist.eliminar_centro(
           p_id_centro => :id
         );
       END;`,
      {
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
        id: id
      }
    );

    await connection.commit();

    res.status(200).json({ 
      mensaje: result.outBinds.resultado.includes('eliminado') ? 
              'Centro eliminado exitosamente' : result.outBinds.resultado
    });
  } catch (error) {
    if (error.message.includes('ORA-02292')) {
      res.status(409).json({ error: 'No se puede eliminar: el centro tiene dependencias' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

export {
  obtenerCentros,
  obtenerCentroPorId,
  crearCentro,
  actualizarCentro,
  eliminarCentro
};