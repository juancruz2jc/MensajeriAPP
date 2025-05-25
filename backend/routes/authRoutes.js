import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import oracledb from 'oracledb';

const router = express.Router();
dotenv.config();

router.post('/register', async (req, res) => {
    const {nombre, cedula, telefono, edad, sexo, direccion, nombreusuario, password}=req.body;

    let connection;
    try {
        connection = await oracledb.getConnection();

        // Insertar persona y obtener ID_PERSONA
        const resultPersona = await connection.execute(
            `INSERT INTO PERSONA (ID_PERSONA, NOMBRE_PERSONA, CEDULA_PERSONA, TELEFONO_PERSONA, EDAD, SEXO)
             VALUES (SEQ_PERSONA.NEXTVAL, :nombre, :cedula, :telefono, :edad, :sexo)
             RETURNING ID_PERSONA INTO :id`,
            {
                nombre,
                cedula,
                telefono,
                edad,
                sexo,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        );
        const idPersona = resultPersona.outBinds.id[0];

        // Insertar cliente
        const resultCliente = await connection.execute(
            `INSERT INTO CLIENTE (ID_CLIENTE, DIRECCION_CLIENTE, ID_PERSONA)
             VALUES (SEQ_CLIENTE.NEXTVAL, :direccion, :idPersona)
             RETURNING ID_CLIENTE INTO :id`,
            {
                direccion,
                idPersona,
                id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        );
        const idCliente = resultCliente.outBinds.id[0];

        // Encriptar contraseña
        const hash = await bcrypt.hash(password, 10);

        // Insertar usuario
        await connection.execute(
            `INSERT INTO USUARIO (ID_USUARIO, ID_PERSONA, NOMBRE_USUARIO, PASSWORD_HASH, ROL)
             VALUES (SEQ_USUARIO.NEXTVAL, :idPersona, :nombreusuario, :hash, 'cliente')`,
            { idPersona, nombreusuario, hash }
        );

        await connection.commit();

        res.status(201).json({
            mensaje: 'Registro exitoso',
            id_persona: idPersona,
            id_cliente: idCliente
        });
    } catch (err) {
        console.error(err);
        if (err.message.includes('ORA-00001')) {
            res.status(409).json({ error: 'Usuario o cédula ya existen' });
        } else {
            res.status(500).json({ error: err.message });
        }
    } finally {
        if (connection) await connection.close();
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { nombreusuario, password } = req.body;

    let connection;
    try {
        connection = await oracledb.getConnection();

        // 1. Buscar usuario por nombreusuario
        const result = await connection.execute(
            `SELECT u.ID_USUARIO, u.PASSWORD_HASH, u.ROL, p.NOMBRE_PERSONA, p.ID_PERSONA
       FROM USUARIO u
       JOIN PERSONA p ON u.ID_PERSONA = p.ID_PERSONA
       WHERE u.NOMBRE_USUARIO = :nombreusuario`,
            [nombreusuario]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const columns = result.metaData.map(c => c.name);
        const row = result.rows[0];
        const usuario = columns.reduce((acc, col, i) => {
            acc[col] = row[i];
            return acc;
        }, {});

        // 2. Verificar contraseña
        const validPassword = await bcrypt.compare(password, usuario.PASSWORD_HASH);
        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // 3. Generar token JWT
        const token = jwt.sign(
            {
                id_usuario: usuario.ID_USUARIO,
                id_persona: usuario.ID_PERSONA,
                nombre: usuario.NOMBRE_PERSONA,
                rol: usuario.ROL
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({ mensaje: 'Login exitoso', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

export default router;