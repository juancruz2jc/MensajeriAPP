--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- PAQUETES:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Paquete para el control paquetes:
CREATE OR REPLACE PACKAGE pkg_paquete AS
  PROCEDURE crear_paquete(
    p_peso           IN NUMBER,
    p_dimensiones    IN VARCHAR2,
    p_contenido      IN VARCHAR2,
    p_estado         IN NUMBER,
    p_id_cliente     IN NUMBER,
    p_id_centro      IN NUMBER
  );

  PROCEDURE actualizar_estado_paquete(
    p_id_paquete     IN NUMBER,
    p_nuevo_estado   IN NUMBER
  );

  PROCEDURE eliminar_paquete(
    p_id_paquete     IN NUMBER
  );

  PROCEDURE mostrar_paquete(
    p_id_paquete     IN NUMBER
  );
END pkg_paquete;
/

--------------------------------------------------------------------------------

-- Secuencia de autoincremento del id:
CREATE SEQUENCE seq_paquete
  START WITH 1000
  INCREMENT BY 1
  NOCACHE;

--------------------------------------------------------------------------------

-- Cuerpo del paquete:
CREATE OR REPLACE PACKAGE BODY pkg_paquete AS

  PROCEDURE crear_paquete(
    p_peso           IN NUMBER,
    p_dimensiones    IN VARCHAR2,
    p_contenido      IN VARCHAR2,
    p_estado         IN NUMBER,
    p_id_cliente     IN NUMBER,
    p_id_centro      IN NUMBER
  ) IS
    v_id_paquete NUMBER;
  BEGIN
    v_id_paquete := seq_paquete.NEXTVAL;

    INSERT INTO PAQUETE (
      ID_PAQUETE, PESO, DIMENSIONES, CONTENIDO,
      ESTADO_PAQUETE, ID_CLIENTE, ID_CENTRO_DISTRIBUCION
    ) VALUES (
      v_id_paquete, p_peso, p_dimensiones, p_contenido,
      p_estado, p_id_cliente, p_id_centro
    );

    DBMS_OUTPUT.PUT_LINE('Paquete creado con ID: ' || v_id_paquete);

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al crear paquete: ' || SQLERRM);
  END;

  -- Procedimiento para actualizar el estado de un paquete
  PROCEDURE actualizar_estado_paquete(
    p_id_paquete     IN NUMBER,
    p_nuevo_estado   IN NUMBER
  ) IS
  BEGIN
    UPDATE PAQUETE
    SET ESTADO_PAQUETE = p_nuevo_estado
    WHERE ID_PAQUETE = p_id_paquete;

    IF SQL%ROWCOUNT = 0 THEN
      DBMS_OUTPUT.PUT_LINE('No se encontro el paquete con ID: ' || p_id_paquete);
    ELSE
      DBMS_OUTPUT.PUT_LINE('Estado actualizado correctamente.');
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al actualizar estado: ' || SQLERRM);
  END;

  -- Procedimiento para eliminar un paquete
  PROCEDURE eliminar_paquete(
    p_id_paquete IN NUMBER
  ) IS
  BEGIN
    DELETE FROM PAQUETE WHERE ID_PAQUETE = p_id_paquete;

    IF SQL%ROWCOUNT = 0 THEN
      DBMS_OUTPUT.PUT_LINE('No existe el paquete con ID: ' || p_id_paquete);
    ELSE
      DBMS_OUTPUT.PUT_LINE('Paquete eliminado correctamente.');
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al eliminar paquete: ' || SQLERRM);
  END;

  -- Procedimiento para mostrar datos de un paquete
  PROCEDURE mostrar_paquete(
    p_id_paquete IN NUMBER
  ) IS
    v_peso          PAQUETE.PESO%TYPE;
    v_dimensiones   PAQUETE.DIMENSIONES%TYPE;
    v_contenido     PAQUETE.CONTENIDO%TYPE;
    v_estado        PAQUETE.ESTADO_PAQUETE%TYPE;
  BEGIN
    SELECT PESO, DIMENSIONES, CONTENIDO, ESTADO_PAQUETE
    INTO v_peso, v_dimensiones, v_contenido, v_estado
    FROM PAQUETE
    WHERE ID_PAQUETE = p_id_paquete;

    DBMS_OUTPUT.PUT_LINE('Paquete ID: ' || p_id_paquete);
    DBMS_OUTPUT.PUT_LINE('Peso: ' || v_peso || ' kg');
    DBMS_OUTPUT.PUT_LINE('Dimensiones: ' || v_dimensiones);
    DBMS_OUTPUT.PUT_LINE('Contenido: ' || v_contenido);
    DBMS_OUTPUT.PUT_LINE('Estado: ' || v_estado);

  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      DBMS_OUTPUT.PUT_LINE('Paquete no encontrado con ID: ' || p_id_paquete);
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al consultar paquete: ' || SQLERRM);
  END;

END pkg_paquete;
/

--------------------------------------------------------------------------------

-- Ejemplo de uso:

-- Crear:
BEGIN
  pkg_paquete.crear_paquete(
    p_peso        => 3.2,
    p_dimensiones => '30x20x10',
    p_contenido   => 'Pantalones',
    p_estado      => 0,
    p_id_cliente  => 101,     -- ID del cliente previamente creado
    p_id_centro   => 1        -- ID del centro de distribucion
  );
END;
/

-- Actualizar:
BEGIN
  pkg_paquete.actualizar_estado_paquete(
    p_id_paquete   => 1001,
    p_nuevo_estado => 1  -- 1 = Entregado
  );
END;
/

--Eliminar:
BEGIN
  pkg_paquete.eliminar_paquete(1001);
END;
/

--Mostrar:
BEGIN
  pkg_paquete.mostrar_paquete(1001);
END;
/

select * from paquete;
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Paquete para facturas:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Secuencia de autoincremento del id:
CREATE SEQUENCE seq_factura
  START WITH 500
  INCREMENT BY 1
  NOCACHE;

--------------------------------------------------------------------------------

-- -- Paquete para el control de las facturas:
CREATE OR REPLACE PACKAGE pkg_facturacion AS
  PROCEDURE crear_factura(
    p_detalle      IN VARCHAR2,
    p_estadopago   IN NUMBER,
    p_monto_total  IN NUMBER,
    p_fecha        IN DATE,
    p_metodo_pago  IN VARCHAR2,
    p_iva          IN NUMBER,
    p_descuento    IN NUMBER,
    p_id_paquete   IN NUMBER
  );

  PROCEDURE pagar_factura(
    p_id_factura IN NUMBER
  );

  PROCEDURE mostrar_factura(
    p_id_factura IN NUMBER
  );
END pkg_facturacion;
/

--------------------------------------------------------------------------------

-- Cuerpo del paquete:
CREATE OR REPLACE PACKAGE BODY pkg_facturacion AS

  PROCEDURE crear_factura(
    p_detalle      IN VARCHAR2,
    p_estadopago   IN NUMBER,
    p_monto_total  IN NUMBER,
    p_fecha        IN DATE,
    p_metodo_pago  IN VARCHAR2,
    p_iva          IN NUMBER,
    p_descuento    IN NUMBER,
    p_id_paquete   IN NUMBER
  ) IS
    v_id_factura NUMBER;
  BEGIN
    v_id_factura := seq_factura.NEXTVAL;

    INSERT INTO FACTURA (
      ID_FACTURA, DETALLE_CARGO, ESTADOPAGO, MONTO_TOTAL,
      FECHA_FACTURA, METODO_PAGO, IVA, DESCUENTO, ID_PAQUETE
    ) VALUES (
      v_id_factura, p_detalle, p_estadopago, p_monto_total,
      p_fecha, p_metodo_pago, p_iva, p_descuento, p_id_paquete
    );

    DBMS_OUTPUT.PUT_LINE('Factura creada con ID: ' || v_id_factura);

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al crear factura: ' || SQLERRM);
  END;

  PROCEDURE pagar_factura(
    p_id_factura IN NUMBER
  ) IS
  BEGIN
    UPDATE FACTURA
    SET ESTADOPAGO = 1
    WHERE ID_FACTURA = p_id_factura;

    IF SQL%ROWCOUNT = 0 THEN
      DBMS_OUTPUT.PUT_LINE('Factura no encontrada.');
    ELSE
      DBMS_OUTPUT.PUT_LINE('Factura marcada como pagada.');
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al actualizar factura: ' || SQLERRM);
  END;

  PROCEDURE mostrar_factura(
    p_id_factura IN NUMBER
  ) IS
    v_detalle    FACTURA.DETALLE_CARGO%TYPE;
    v_monto      FACTURA.MONTO_TOTAL%TYPE;
    v_estado     FACTURA.ESTADOPAGO%TYPE;
  BEGIN
    SELECT DETALLE_CARGO, MONTO_TOTAL, ESTADOPAGO
    INTO v_detalle, v_monto, v_estado
    FROM FACTURA
    WHERE ID_FACTURA = p_id_factura;

    DBMS_OUTPUT.PUT_LINE('Factura ID: ' || p_id_factura);
    DBMS_OUTPUT.PUT_LINE('Detalle: ' || v_detalle);
    DBMS_OUTPUT.PUT_LINE('Monto: $' || v_monto);
    DBMS_OUTPUT.PUT_LINE('Estado: ' || CASE WHEN v_estado = 0 THEN 'Pendiente' ELSE 'Pagado' END);

  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      DBMS_OUTPUT.PUT_LINE('Factura no encontrada.');
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al consultar factura: ' || SQLERRM);
  END;

END pkg_facturacion;
/

--------------------------------------------------------------------------------

-- Ejemplo de uso:

-- Crear:
BEGIN
  pkg_facturacion.crear_factura(
    p_detalle      => 'Servicio express - caja mediana',
    p_estadopago   => 0,
    p_monto_total  => 15000,
    p_fecha        => SYSDATE,
    p_metodo_pago  => 'Tarjeta',
    p_iva          => 19,
    p_descuento    => 0,
    p_id_paquete   => 1001
  );
END;
/

-- Pagar factura:
BEGIN
  pkg_facturacion.pagar_factura(500);
END;
/

-- Mostrar factura:
BEGIN
  pkg_facturacion.mostrar_factura(500);
END;
/

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Paquete para crear, actualizar, eliminar y mostrar facturas:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Secuencia de autoincremento del id:
CREATE SEQUENCE seq_ruta
  START WITH 1000
  INCREMENT BY 1
  NOCACHE;

--------------------------------------------------------------------------------

-- Paquete para control de rutas:
CREATE OR REPLACE PACKAGE pkg_rutas AS
  PROCEDURE crear_ruta(
    p_origen        IN VARCHAR2,
    p_destino       IN VARCHAR2,
    p_fecha_salida  IN DATE,
    p_fecha_llegada IN DATE,
    p_estado        IN NUMBER
  );

  PROCEDURE asignar_paquete_a_ruta(
    p_id_paquete IN NUMBER,
    p_id_ruta    IN NUMBER
  );

  PROCEDURE listar_paquetes_por_ruta(
    p_id_ruta IN NUMBER
  );
END pkg_rutas;
/

--------------------------------------------------------------------------------

-- Cuerpo del paquete:
CREATE OR REPLACE PACKAGE BODY pkg_rutas AS

  PROCEDURE crear_ruta(
    p_origen        IN VARCHAR2,
    p_destino       IN VARCHAR2,
    p_fecha_salida  IN DATE,
    p_fecha_llegada IN DATE,
    p_estado        IN NUMBER
  ) IS
    v_id_ruta NUMBER;
  BEGIN
    v_id_ruta := seq_ruta.NEXTVAL;

    INSERT INTO RUTA (
      ID_RUTA, ORIGEN, DESTINO, FECHA_SALIDA, FECHA_LLEGADA, ESTADO
    ) VALUES (
      v_id_ruta, p_origen, p_destino, p_fecha_salida, p_fecha_llegada, p_estado
    );

    DBMS_OUTPUT.PUT_LINE('Ruta creada con ID: ' || v_id_ruta);

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al crear ruta: ' || SQLERRM);
  END;

  PROCEDURE asignar_paquete_a_ruta(
    p_id_paquete IN NUMBER,
    p_id_ruta    IN NUMBER
  ) IS
  BEGIN
    INSERT INTO PAQUETE_RUTA (ID_PAQUETE, ID_RUTA)
    VALUES (p_id_paquete, p_id_ruta);

    DBMS_OUTPUT.PUT_LINE('Paquete asignado a la ruta correctamente.');

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al asignar paquete a ruta: ' || SQLERRM);
  END;

  PROCEDURE listar_paquetes_por_ruta(
    p_id_ruta IN NUMBER
  ) IS
    CURSOR c_paquetes IS
      SELECT P.ID_PAQUETE, P.CONTENIDO, P.ESTADO_PAQUETE
      FROM PAQUETE P
      JOIN PAQUETE_RUTA PR ON P.ID_PAQUETE = PR.ID_PAQUETE
      WHERE PR.ID_RUTA = p_id_ruta;

    v_paquete_id      PAQUETE.ID_PAQUETE%TYPE;
    v_contenido       PAQUETE.CONTENIDO%TYPE;
    v_estado          PAQUETE.ESTADO_PAQUETE%TYPE;
  BEGIN
    OPEN c_paquetes;
    LOOP
      FETCH c_paquetes INTO v_paquete_id, v_contenido, v_estado;
      EXIT WHEN c_paquetes%NOTFOUND;
      DBMS_OUTPUT.PUT_LINE('ID: ' || v_paquete_id || ', Contenido: ' || v_contenido || ', Estado: ' || v_estado);
    END LOOP;
    CLOSE c_paquetes;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al listar paquetes por ruta: ' || SQLERRM);
  END;

END pkg_rutas;
/

--------------------------------------------------------------------------------

-- Ejemplo de uso:

-- Crear:
BEGIN
  pkg_rutas.crear_ruta(
    p_origen        => 'Centro Norte',
    p_destino       => 'Centro Sur',
    p_fecha_salida  => SYSDATE,
    p_fecha_llegada => SYSDATE + 2,
    p_estado        => 0  -- 0 = En curso
  );
END;
/

-- Asignar:
BEGIN
  pkg_rutas.asignar_paquete_a_ruta(
    p_id_paquete => 1001,
    p_id_ruta    => 1000
  );
END;
/

-- Listar:
BEGIN
  pkg_rutas.listar_paquetes_por_ruta(1000);
END;
/

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- Paquete para el control de distribucion:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Secuencia para el autoincremento de los id:
CREATE SEQUENCE seq_centro_dist
  START WITH 10
  INCREMENT BY 1
  NOCACHE;

--------------------------------------------------------------------------------

-- Paquete para crear, actualizar, eliminar y mostrar centros de distribucion:
CREATE OR REPLACE PACKAGE pkg_centro_dist AS
  FUNCTION crear_centro(
    p_ubicacion    IN VARCHAR2,
    p_capacidad    IN NUMBER
  ) RETURN NUMBER;

  FUNCTION actualizar_capacidad(
    p_id_centro    IN NUMBER,
    p_nueva_cap    IN NUMBER
  ) RETURN VARCHAR2;

  FUNCTION eliminar_centro(
    p_id_centro    IN NUMBER
  ) RETURN VARCHAR2;

  FUNCTION obtener_info_centro(
    p_id_centro    IN NUMBER
  ) RETURN VARCHAR2;
END pkg_centro_dist;
/

--------------------------------------------------------------------------------

-- Cuerpo del paquete:
CREATE OR REPLACE PACKAGE BODY pkg_centro_dist AS

  FUNCTION crear_centro(
    p_ubicacion    IN VARCHAR2,
    p_capacidad    IN NUMBER
  ) RETURN NUMBER IS
    v_id NUMBER;
  BEGIN
    v_id := seq_centro_dist.NEXTVAL;

    INSERT INTO CENTRO_DISTRIBUCION (
      ID_CENTRO_DISTRIBUCION, UBICACION_CEN_DIST, CAPACIDAD
    ) VALUES (
      v_id, p_ubicacion, p_capacidad
    );

    RETURN v_id;

  EXCEPTION
    WHEN OTHERS THEN
      DBMS_OUTPUT.PUT_LINE('Error al crear centro: ' || SQLERRM);
      RETURN NULL;
  END;

  FUNCTION actualizar_capacidad(
    p_id_centro    IN NUMBER,
    p_nueva_cap    IN NUMBER
  ) RETURN VARCHAR2 IS
  BEGIN
    UPDATE CENTRO_DISTRIBUCION
    SET CAPACIDAD = p_nueva_cap
    WHERE ID_CENTRO_DISTRIBUCION = p_id_centro;

    IF SQL%ROWCOUNT = 0 THEN
      RETURN 'Centro no encontrado.';
    ELSE
      RETURN 'Capacidad actualizada.';
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error: ' || SQLERRM;
  END;

  FUNCTION eliminar_centro(
    p_id_centro    IN NUMBER
  ) RETURN VARCHAR2 IS
  BEGIN
    DELETE FROM CENTRO_DISTRIBUCION
    WHERE ID_CENTRO_DISTRIBUCION = p_id_centro;

    IF SQL%ROWCOUNT = 0 THEN
      RETURN 'Centro no encontrado.';
    ELSE
      RETURN 'Centro eliminado.';
    END IF;

  EXCEPTION
    WHEN OTHERS THEN
      RETURN 'Error: ' || SQLERRM;
  END;

  FUNCTION obtener_info_centro(
    p_id_centro    IN NUMBER
  ) RETURN VARCHAR2 IS
    v_ubicacion CENTRO_DISTRIBUCION.UBICACION_CEN_DIST%TYPE;
    v_capacidad CENTRO_DISTRIBUCION.CAPACIDAD%TYPE;
  BEGIN
    SELECT UBICACION_CEN_DIST, CAPACIDAD
    INTO v_ubicacion, v_capacidad
    FROM CENTRO_DISTRIBUCION
    WHERE ID_CENTRO_DISTRIBUCION = p_id_centro;

    RETURN 'Centro: ' || v_ubicacion || ', Capacidad: ' || v_capacidad;

  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RETURN 'Centro no encontrado.';
    WHEN OTHERS THEN
      RETURN 'Error: ' || SQLERRM;
  END;

END pkg_centro_dist;
/

--------------------------------------------------------------------------------

-- Ejemplo de uso:

-- Crear:
DECLARE
  v_id NUMBER;
BEGIN
  v_id := pkg_centro_dist.crear_centro(
    p_ubicacion => 'Zona Industrial Norte',
    p_capacidad => 250
  );

  IF v_id IS NOT NULL THEN
    DBMS_OUTPUT.PUT_LINE('Centro creado con ID: ' || v_id);
  ELSE
    DBMS_OUTPUT.PUT_LINE('Error al crear centro.');
  END IF;
END;
/

-- Actualizar:
DECLARE
  v_resultado VARCHAR2(100);
BEGIN
  v_resultado := pkg_centro_dist.actualizar_capacidad(
    p_id_centro => 10,        -- ID del centro a modificar
    p_nueva_cap => 300
  );

  DBMS_OUTPUT.PUT_LINE(v_resultado);
END;
/

-- Eliminar:
DECLARE
  v_mensaje VARCHAR2(100);
BEGIN
  v_mensaje := pkg_centro_dist.eliminar_centro(10);  -- ID del centro a eliminar

  DBMS_OUTPUT.PUT_LINE(v_mensaje);
END;
/

-- Mostrar:
DECLARE
  v_info VARCHAR2(200);
BEGIN
  v_info := pkg_centro_dist.obtener_info_centro(10);  -- ID del centro a consultar

  DBMS_OUTPUT.PUT_LINE(v_info);
END;
/

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- VISTAS:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Vista para el cliente y su paqiete:
CREATE VIEW Vista_Paquetes_Completos AS
SELECT 
    PAQ.ID_PAQUETE,
    PER.NOMBRE_PERSONA AS CLIENTE,
    RUT.ORIGEN,
    RUT.DESTINO,
    PAQ.ESTADO_PAQUETE
FROM PAQUETE PAQ
JOIN CLIENTE CLI ON PAQ.ID_CLIENTE = CLI.ID_CLIENTE
JOIN PERSONA PER ON CLI.ID_PERSONA = PER.ID_PERSONA
JOIN PAQUETE_RUTA PR ON PAQ.ID_PAQUETE = PR.ID_PAQUETE
JOIN RUTA RUT ON PR.ID_RUTA = RUT.ID_RUTA;

select * from Vista_Paquetes_Completos;

--------------------------------------------------------------------------------

-- Vista para mostrar empleados en un centron de distribucion:
CREATE VIEW Vista_Paquetes_Detallados AS
SELECT 
    P.ID_PAQUETE,
    P.PESO,
    P.ESTADO_PAQUETE,
    -- Detalles del cliente
    C.ID_CLIENTE,
    PER.NOMBRE_PERSONA AS NOMBRE_CLIENTE,
    PER.CEDULA_PERSONA AS CEDULA_CLIENTE,
    -- Detalles de la ruta
    R.ID_RUTA,
    R.ORIGEN,
    R.DESTINO,
    R.ESTADO AS ESTADO_RUTA
FROM PAQUETE P
JOIN CLIENTE C ON P.ID_CLIENTE = C.ID_CLIENTE
JOIN PERSONA PER ON C.ID_PERSONA = PER.ID_PERSONA
LEFT JOIN PAQUETE_RUTA PR ON P.ID_PAQUETE = PR.ID_PAQUETE
LEFT JOIN RUTA R ON PR.ID_RUTA = R.ID_RUTA;

select * from Vista_Paquetes_Detallados;

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- TRIGGERS RELACIONADOS CON LAS REGLAS DE NEGOCIO:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Trigger para validar el nombre del cargo:
CREATE OR REPLACE TRIGGER trg_valida_nombre_cargo
BEFORE INSERT OR UPDATE ON CARGO
FOR EACH ROW
BEGIN
    IF :NEW.NOMBRE_CARGO NOT IN ('Conductor', 'Operador', 'Gerente', 'Administrador') THEN
        RAISE_APPLICATION_ERROR(-20002, 
            'Cargo no valido. Valores permitidos: Conductor, Operador, Gerente, Administrador.');
    END IF;
END;
/

--------------------------------------------------------------------------------

-- Trigger para validar el metodo de pago:
CREATE OR REPLACE TRIGGER trg_valida_metodo_pago
BEFORE INSERT OR UPDATE ON FACTURA
FOR EACH ROW
BEGIN
    IF :NEW.METODO_PAGO NOT IN ('Tarjeta', 'Transferencia', 'Efectivo') THEN
        RAISE_APPLICATION_ERROR(-20004, 
            'Metodo de pago no valido. Use: Tarjeta, Transferencia o Efectivo.');
    END IF;
END;
/

--------------------------------------------------------------------------------

-- Trigger para validar el estado del vehiculo:
CREATE OR REPLACE TRIGGER trg_valida_estado_vehiculo
BEFORE INSERT OR UPDATE ON VEHICULO
FOR EACH ROW
BEGIN
    IF :NEW.ESTADO_VEHICULO NOT IN (0, 1, 2) THEN
        RAISE_APPLICATION_ERROR(-20005, 
            'Estado invalido. Valores permitidos: 0=Disponible, 1=En mantenimiento, 2=Fuera de servicio.');
    END IF;
END;
/

--------------------------------------------------------------------------------

-- Trigger para validar el origen de una ruta:
CREATE OR REPLACE TRIGGER trg_valida_origen_ruta
BEFORE INSERT OR UPDATE ON RUTA
FOR EACH ROW
DECLARE
    v_existe_centro NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_existe_centro 
    FROM CENTRO_DISTRIBUCION 
    WHERE ID_CENTRO_DISTRIBUCION = :NEW.ID_CENTRO_ORIGEN;

    IF v_existe_centro = 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 
            'El centro de origen (', :NEW.ID_CENTRO_ORIGEN, ') no existe.');
    END IF;
END;
/

--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
-- CURSORES:
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------

-- Cursor para listar facturas pendientes:
DECLARE
    CURSOR c_facturas_pendientes IS
        SELECT f.ID_FACTURA, p.ID_PAQUETE, f.MONTO_TOTAL, c.NOMBRE_PERSONA
        FROM FACTURA f
        JOIN PAQUETE p ON f.ID_PAQUETE = p.ID_PAQUETE
        JOIN CLIENTE cl ON p.ID_CLIENTE = cl.ID_CLIENTE
        JOIN PERSONA c ON cl.ID_PERSONA = c.ID_PERSONA
        WHERE f.ESTADOPAGO = 0; -- 0 = Pendiente

    v_factura c_facturas_pendientes%ROWTYPE;
BEGIN
    OPEN c_facturas_pendientes;
    LOOP
        FETCH c_facturas_pendientes INTO v_factura;
        EXIT WHEN c_facturas_pendientes%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(
            'Factura: ',  v_factura.ID_FACTURA,  
            ' | Cliente: ',  v_factura.NOMBRE_PERSONA,
            ' | Monto: $' || v_factura.MONTO_TOTAL
        );
    END LOOP;
    CLOSE c_facturas_pendientes;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No hay facturas pendientes.');
END;
/

--------------------------------------------------------------------------------

-- Cursor para listar los empleados
CREATE OR REPLACE PROCEDURE listar_empleados_centro (
    p_id_centro CENTRO_DISTRIBUCION.ID_CENTRO_DISTRIBUCION%TYPE
) IS
    CURSOR c_empleados (centro_id NUMBER) IS
        SELECT e.ID_EMPLEADO, p.NOMBRE_PERSONA, c.NOMBRE_CARGO
        FROM EMPLEADO e
        JOIN PERSONA p ON e.ID_PERSONA = p.ID_PERSONA
        JOIN CARGO c ON e.ID_CARGO = c.ID_CARGO
        JOIN EMPLEADO_CENTRO ec ON e.ID_EMPLEADO = ec.ID_EMPLEADO
        WHERE ec.ID_CENTRO_DISTRIBUCION = centro_id;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== Empleados del Centro ', p_id_centro, ' ===');
    FOR emp IN c_empleados(p_id_centro) LOOP
        DBMS_OUTPUT.PUT_LINE(
            'ID: ',  emp.ID_EMPLEADO,
            ' | Nombre: ', emp.NOMBRE_PERSONA,
            ' | Cargo: ' || emp.NOMBRE_CARGO
        );
    END LOOP;
END;
/
