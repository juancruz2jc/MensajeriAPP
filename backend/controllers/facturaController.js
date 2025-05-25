import oracledb from 'oracledb';

// Crear factura usando el paquete PL/SQL
async function crearFactura(req, res) {
  const {
    detalle,
    estadopago,
    monto_total,
    fecha,
    metodo_pago,
    iva,
    descuento,
    id_paquete
  } = req.body;

  let connection;
  try {
    connection = await oracledb.getConnection();

    // Activar DBMS_OUTPUT
    await connection.execute(`BEGIN DBMS_OUTPUT.ENABLE(NULL); END;`);

    await connection.execute(
      `BEGIN
        pkg_facturacion.crear_factura(
          :p_detalle,
          :p_estadopago,
          :p_monto_total,
          TO_DATE(:p_fecha, 'YYYY-MM-DD'),
          :p_metodo_pago,
          :p_iva,
          :p_descuento,
          :p_id_paquete
        );
      END;`,
      {
        p_detalle: detalle,
        p_estadopago: estadopago,
        p_monto_total: monto_total,
        p_fecha: fecha,
        p_metodo_pago: metodo_pago,
        p_iva: iva,
        p_descuento: descuento,
        p_id_paquete: id_paquete
      }
    );

    // Leer DBMS_OUTPUT
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

    res.status(201).json({ mensaje: 'Factura creada exitosamente', salidaOracle: output.trim() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}


// Marcar factura como pagada
async function pagarFactura(req, res) {
  const { id } = req.params;
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
        pkg_facturacion.pagar_factura(:p_id_factura);
      END;`,
      { p_id_factura: id }
    );

    await connection.commit();

    res.status(200).json({ mensaje: 'Factura marcada como pagada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener factura por ID
async function obtenerFacturaPorId(req, res) {
  const { id } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT * FROM FACTURA WHERE ID_FACTURA = :id`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    const columns = result.metaData.map(c => c.name);
    const factura = columns.reduce((obj, col, index) => {
      obj[col] = result.rows[0][index];
      return obj;
    }, {});

    res.status(200).json(factura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Obtener todas las facturas
async function obtenerFacturas(req, res) {
  let connection;

  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(`SELECT * FROM FACTURA`);

    const columns = result.metaData.map(c => c.name);
    const facturas = result.rows.map(row => {
      return columns.reduce((obj, col, index) => {
        obj[col] = row[index];
        return obj;
      }, {});
    });

    res.status(200).json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.close();
  }
}

// Eliminar factura por ID (opcional si quieres control manual)
async function eliminarFactura(req, res) {
  const { id } = req.params;
  let connection;

  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `DELETE FROM FACTURA WHERE ID_FACTURA = :id`,
      [parseInt(id)]
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    res.status(200).json({ mensaje: 'Factura eliminada correctamente' });
  } catch (error) {
    if (error.message.includes('ORA-02292')) {
      res.status(409).json({ error: 'No se puede eliminar: está asociada a un paquete' });
    } else {
      res.status(500).json({ error: error.message });
    }
  } finally {
    if (connection) await connection.close();
  }
}

export {
  crearFactura,
  pagarFactura,
  obtenerFacturaPorId,
  obtenerFacturas,
  eliminarFactura
};
