import oracledb from 'oracledb';

// Crear paquete (usa el procedimiento pkg_paquete.crear_paquete)
async function crearPaquete(req, res) {
  const { peso, dimensiones, contenido, estado, id_cliente, id_centro } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `BEGIN
        pkg_paquete.crear_paquete(
          :p_peso, :p_dimensiones, :p_contenido, 
          :p_estado, :p_id_cliente, :p_id_centro
        );
      END;`,
      { p_peso: peso, p_dimensiones: dimensiones, p_contenido: contenido, p_estado: estado, p_id_cliente: id_cliente, p_id_centro: id_centro }
    );
    
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

    res.status(201).json({ mensaje: 'Paquete creado exitosamente', salidaOracle: output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Actualizar estado de un paquete
async function actualizarEstadoPaquete(req, res) {
  const { id } = req.params;
  const { nuevo_estado } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `BEGIN
        pkg_paquete.actualizar_estado_paquete(:p_id_paquete, :p_nuevo_estado);
      END;`,
      { p_id_paquete: id, p_nuevo_estado: nuevo_estado }
    );
    await connection.commit();
    res.status(200).json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Actualizar todos los datos de un paquete
async function actualizarPaqueteCompleto(req, res) {
  const { id } = req.params;
  const { peso, dimensiones, contenido, estado, id_cliente, id_centro } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `UPDATE PAQUETE
       SET PESO = :peso,
           DIMENSIONES = :dimensiones,
           CONTENIDO = :contenido,
           ESTADO_PAQUETE = :estado,
           ID_CLIENTE = :id_cliente,
           ID_CENTRO_DISTRIBUCION = :id_centro
       WHERE ID_PAQUETE = :id`,
      {
        peso,
        dimensiones,
        contenido,
        estado,
        id_cliente,
        id_centro,
        id: parseInt(id)
      }
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Paquete no encontrado' });
    }

    res.status(200).json({ mensaje: 'Paquete actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}


// Obtener todos los paquetes con filtros opcionales
async function obtenerPaquetes(req, res) {
  const { estado, cliente, centro } = req.query;
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    let query = `SELECT * FROM PAQUETE`;
    const binds = [];
    const filters = [];
    
    // Construir filtros dinámicos
    if (estado) {
      filters.push(`ESTADO_PAQUETE = :estado`);
      binds.push(parseInt(estado));
    }
    if (cliente) {
      filters.push(`ID_CLIENTE = :cliente`);
      binds.push(parseInt(cliente));
    }
    if (centro) {
      filters.push(`ID_CENTRO_DISTRIBUCION = :centro`);
      binds.push(parseInt(centro));
    }
    
    if (filters.length > 0) {
      query += ` WHERE ${filters.join(' AND ')}`;
    }

    const result = await connection.execute(query, binds);
    await connection.commit();
    
    res.status(200).json({
      count: result.rows.length,
      paquetes: result.rows.map(row => {
        const columns = result.metaData.map(m => m.name);
        return columns.reduce((obj, col, index) => {
          obj[col] = row[index];
          return obj;
        }, {});
      })
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener un paquete por ID
async function obtenerPaquetePorId(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT * FROM PAQUETE WHERE ID_PAQUETE = :id`,
      [parseInt(id)]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Paquete no encontrado' });
    }
    
    await connection.commit();
    
    // Mapear resultado a objeto con nombres de columnas
    const columns = result.metaData.map(m => m.name);
    const paquete = columns.reduce((obj, col, index) => {
      obj[col] = result.rows[0][index];
      return obj;
    }, {});
    
    res.status(200).json(paquete);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Eliminar un paquete por ID
async function eliminarPaquete(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();
    
    // Ejecutar el procedimiento del paquete PL/SQL
    const result = await connection.execute(
      `BEGIN
        pkg_paquete.eliminar_paquete(:p_id_paquete);
      END;`,
      { p_id_paquete: id }
    );

    await connection.commit();

    // Verificar si se eliminó algún registro
    if (result.rowsAffected === 0) {
      return res.status(404).json({ 
        mensaje: 'No se encontró el paquete con el ID especificado' 
      });
    }

    res.status(200).json({ 
      mensaje: 'Paquete eliminado correctamente',
      id_paquete: id
    });

  } catch (error) {
    // Manejar errores de constraints de Oracle
    if (error.message.includes('ORA-02292')) {
      return res.status(409).json({
        error: 'No se puede eliminar: El paquete tiene rutas asociadas'
      });
    }
    
    res.status(500).json({ 
      error: `Error al eliminar paquete: ${error.message}` 
    });
    
  } finally {
    if (connection) await connection.close();
  }
}

export { 
  crearPaquete, 
  actualizarEstadoPaquete,
  obtenerPaquetes,
  obtenerPaquetePorId,
  eliminarPaquete,
  actualizarPaqueteCompleto
};