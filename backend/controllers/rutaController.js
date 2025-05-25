import oracledb from 'oracledb';

// Crear una nueva ruta
async function crearRuta(req, res) {
    const { origen, destino, fecha_salida, fecha_llegada, estado } = req.body;
    let connection;
  
    try {
      connection = await oracledb.getConnection();
  
      await connection.execute(`BEGIN DBMS_OUTPUT.ENABLE(NULL); END;`);
  
      await connection.execute(
        `BEGIN
          pkg_rutas.crear_ruta(
            :p_origen,
            :p_destino,
            TO_DATE(:p_fecha_salida, 'YYYY-MM-DD'),
            TO_DATE(:p_fecha_llegada, 'YYYY-MM-DD'),
            :p_estado
          );
        END;`,
        {
          p_origen: origen,
          p_destino: destino,
          p_fecha_salida: fecha_salida,
          p_fecha_llegada: fecha_llegada,
          p_estado: estado
        }
      );
  
      // Captura DBMS_OUTPUT si hay errores silenciosos
      let output = '';
      let resultLine;
      do {
        resultLine = await connection.execute(
          `BEGIN DBMS_OUTPUT.GET_LINE(:line, :status); END;`,
          {
            line: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
            status: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          }
        );
        if (resultLine.outBinds.status === 0) {
          output += resultLine.outBinds.line + '\n';
        }
      } while (resultLine.outBinds.status === 0);
  
      await connection.commit();
  
      res.status(201).json({
        mensaje: 'Ruta creada exitosamente',
        salidaOracle: output.trim()
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      if (connection) await connection.close();
    }
}
  
  

// Obtener todas las rutas
async function obtenerRutas(req, res) {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(`SELECT * FROM RUTA`);

    const columns = result.metaData.map(col => col.name);
    const rutas = result.rows.map(row => {
      return columns.reduce((obj, col, i) => {
        obj[col] = row[i];
        return obj;
      }, {});
    });

    res.status(200).json(rutas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener una ruta por ID
async function obtenerRutaPorId(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT * FROM RUTA WHERE ID_RUTA = :id`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Ruta no encontrada' });
    }

    const columns = result.metaData.map(c => c.name);
    const ruta = columns.reduce((obj, col, index) => {
      obj[col] = result.rows[0][index];
      return obj;
    }, {});

    res.status(200).json(ruta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Marcar ruta como completada
async function marcarRutaCompletada(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
        pkg_rutas.marcar_completada(:p_id_ruta);
      END;`,
      { p_id_ruta: parseInt(id) }
    );

    await connection.commit();

    res.status(200).json({ mensaje: 'Ruta marcada como completada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Eliminar una ruta
async function eliminarRuta(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
        pkg_rutas.eliminar_ruta(:p_id_ruta);
      END;`,
      { p_id_ruta: parseInt(id) }
    );

    await connection.commit();

    res.status(200).json({ mensaje: 'Ruta eliminada correctamente' });
  } catch (error) {
    if (error.message.includes('ORA-02292')) {
      res.status(409).json({ error: 'No se puede eliminar: la ruta tiene dependencias' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

export {
  crearRuta,
  obtenerRutas,
  obtenerRutaPorId,
  eliminarRuta,
  marcarRutaCompletada
};
