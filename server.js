const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
require('dotenv').config();

// --- Configuración de Multer para subida de imágenes ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[UPLOADS] Directorio "uploads/" creado.');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const imageFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|svg\+xml|tiff/;
  const mimeOk = allowedTypes.test(file.mimetype);
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP, BMP, SVG, TIFF).'));
  }
};

const docFilter = (_req, file, cb) => {
  const allowedTypes = /pdf|msword|officedocument.wordprocessingml.document|plain/;
  const mimeOk = allowedTypes.test(file.mimetype);
  const extOk = /pdf|doc|docx|txt/.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten documentos PDF, Word (DOC, DOCX) y Texto Plano (TXT).'));
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB máximo
});

const docUpload = multer({
  storage,
  fileFilter: docFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB máximo para archivos
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend desde la raíz del proyecto con tipos MIME explícitos
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Servir imágenes subidas
app.use('/uploads', express.static(uploadsDir));

// Configuración básica de conexión
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

// Variable para el pool principal de MySQL
let pool;

/**
 * Función de utilidad para cifrar contraseñas con SHA-256
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}


/**
 * Middleware para validar que el usuario que realiza la petición es Administrador.
 * Verifica la cabecera "Authorization" estructurada como "Bearer username:role".
 */
async function checkAdmin(req, res, next) {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No autenticado.' });
  }

  const token = authHeader.split(' ')[1];
  const parts = token.split(':');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Formato de token de sesión inválido.' });
  }

  const [username, role] = parts;

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }

  try {
    const [rows] = await pool.query('SELECT role, name FROM users WHERE username = ?', [username]);
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado. Usuario no autorizado o eliminado.' });
    }
    req.adminUsername = username;
    req.adminRealName = rows[0].name;
    next();
  } catch (err) {
    console.error('Error en middleware checkAdmin:', err.message);
    res.status(500).json({ error: 'Error interno de autenticación' });
  }
}

/**
 * Inicializa la base de datos de MySQL.
 */
async function initializeDatabase() {
  const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.JAWSDB_URL || process.env.CLEARDB_DATABASE_URL;
  const targetDbName = process.env.DB_NAME || 'crece_db';

  if (dbUrl) {
    console.log('[DB-MySQL] Detectada URI de conexión externa. Conectando...');
    try {
      // Agregar multipleStatements si no está ya en la URI
      const urlSeparator = dbUrl.includes('?') ? '&' : '?';
      const parsedUrl = dbUrl.includes('multipleStatements=true') ? dbUrl : `${dbUrl}${urlSeparator}multipleStatements=true`;
      
      pool = mysql.createPool(parsedUrl);
      await pool.query('SELECT 1');
      console.log('[DB-MySQL] Conectado exitosamente usando la URI de conexión.');
      await verifyAndSeedTables();
      return;
    } catch (uriError) {
      console.error('[DB-MySQL] Error al intentar conectar con la URI de conexión:', uriError.message);
      console.log('[DB-MySQL] Reintentando conexión con variables de entorno individuales...');
    }
  }

  console.log(`[DB-MySQL] Iniciando conexión a MySQL/MariaDB para: "${targetDbName}"...`);

  try {
    pool = mysql.createPool({
      ...dbConfig,
      database: targetDbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });

    await pool.query('SELECT 1');
    console.log(`[DB-MySQL] Conectado exitosamente a la base de datos "${targetDbName}".`);

    // Verificar si las tablas existen
    await verifyAndSeedTables();
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR' || error.errno === 1049) {
      console.log(`[DB-MySQL] La base de datos "${targetDbName}" no existe. Creándola automáticamente...`);

      try {
        const adminConnection = await mysql.createConnection(dbConfig);
        await adminConnection.query(`CREATE DATABASE IF NOT EXISTS ${targetDbName}`);
        console.log(`[DB-MySQL] Base de datos "${targetDbName}" creada con éxito.`);
        await adminConnection.end();

        pool = mysql.createPool({
          ...dbConfig,
          database: targetDbName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          multipleStatements: true
        });

        await verifyAndSeedTables();
      } catch (adminError) {
        console.error('[DB-MySQL] Error crítico al intentar crear la base de datos:', adminError.message);
        process.exit(1);
      }
    } else {
      console.error('[DB-MySQL] Error de conexión a MySQL. Verifica XAMPP y tus credenciales en el archivo .env.');
      console.error('[DB-MySQL] Detalle del error:', error.message);
    }
  }
}

/**
 * Crea las tablas (si no existen) y solo inserta datos semilla si están vacías.
 * NUNCA borra datos existentes.
 */
async function verifyAndSeedTables() {
  try {
    // 1. Crear las tablas (CREATE TABLE IF NOT EXISTS — no destruye nada)
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('[DB-MySQL] Tablas verificadas/creadas con schema.sql.');
    } else {
      console.warn('[DB-MySQL] ADVERTENCIA: No se encontró schema.sql.');
      return;
    }

    // 2. Solo insertar datos semilla si las tablas están vacías
    const [userRows] = await pool.query('SELECT COUNT(*) AS total FROM users');
    if (userRows[0].total === 0) {
      console.log('[DB-SEED] Tabla "users" vacía. Insertando admin semilla...');
      await pool.query(
        "INSERT INTO users (username, name, email, password, role) VALUES ('admin', 'Admin Carlos', 'admin@crece.edu', 'e7c5e4e687eba0c36d42eb00e0b4779d98247b1932fbfa85d2eea25332ba2525', 'admin')"
      );
    }

    const [galRows] = await pool.query('SELECT COUNT(*) AS total FROM galeria');
    if (galRows[0].total === 0) {
      console.log('[DB-SEED] Tabla "galeria" vacía. Insertando datos semilla...');
      await pool.query(`
        INSERT INTO galeria (title, description, grade, date, src) VALUES
        ('Taller de Robótica Básica', 'Estudiantes de 5° grado armando sus primeros prototipos con bloques sensores.', '5°', '2026-05-10', 'img/galeria_robotica_5.png'),
        ('Prueba de Algoritmos en Scratch', 'Clase práctica de lógica de programación en la sala de informática.', '5°', '2026-05-18', 'img/galeria_scratch_5.png'),
        ('Armado de Servidores en Rack', 'Estudiantes de 6° grado realizando el cableado estructurado del rack del laboratorio.', '6°', '2026-04-22', 'img/galeria_servidor_6.png'),
        ('Prototipo de Domótica Integrado', 'Presentación del sistema de luces automatizado controlado por Arduino.', '6°', '2026-06-02', 'img/galeria_domotica_6.png'),
        ('Presentación de Software Educativo', 'Estudiantes de 3° BTI compartiendo sus juegos interactivos con alumnos de primaria.', '6°', '2026-06-10', 'img/galeria_presentacion_bti.png'),
        ('Clase Abierta de Ciberseguridad', 'Charla y taller sobre navegación segura y prevención de phishing.', '6°', '2026-06-12', 'img/galeria_seguridad.png')
      `);
    }

    const [projRows] = await pool.query('SELECT COUNT(*) AS total FROM proyectos');
    if (projRows[0].total === 0) {
      console.log('[DB-SEED] Tabla "proyectos" vacía. Insertando datos semilla...');
      await pool.query(`
        INSERT INTO proyectos (title, author, grade, description, scratch_url, thumbnail) VALUES
        ('Simulador de Circuito Vial', 'Equipo Alfa - 5° Grado', '5°', 'Un simulador interactivo de semáforos y cruces peatonales inteligentes desarrollado en Scratch.', 'https://scratch.mit.edu/projects/1012345678/embed', 'img/scratch_vial.png'),
        ('Laberinto del Saber Informático', 'Sofía Duarte y Lucas Ríos - 5° Grado', '5°', 'Un divertido juego de laberintos donde para avanzar debes responder preguntas de hardware, software y redes.', 'https://scratch.mit.edu/projects/1012345679/embed', 'img/scratch_laberinto.png'),
        ('Calculadora de Matrices Binarias', 'Matías Gómez - 6° Grado', '6°', 'Herramienta que realiza conversiones entre sistemas numéricos decimales, binarios y hexadecimales.', 'https://scratch.mit.edu/projects/1012345680/embed', 'img/scratch_calculadora.png'),
        ('Panel de Domótica Virtual', 'Equipo IoT - 6° Grado', '6°', 'Simulador de una casa inteligente con alarmas, luces y sensores de temperatura.', 'https://scratch.mit.edu/projects/1012345681/embed', 'img/scratch_domotica.png')
      `);
    }

    const [guiRows] = await pool.query('SELECT COUNT(*) AS total FROM guiones');
    if (guiRows[0].total === 0) {
      console.log('[DB-SEED] Tabla "guiones" vacía. Insertando datos semilla...');
      await pool.query(`
        INSERT INTO guiones (title, grade, subject, date, pdf_url, description) VALUES
        ('Introducción a Algoritmos y Pseudocódigo', '5°', 'Programación', '2026-03-10', 'pdf/guion_introduccion_algoritmos.pdf', 'Conceptos iniciales sobre la estructuración de la lógica.'),
        ('Uso de Variables y Condicionales en Bloques', '5°', 'Programación', '2026-04-14', 'pdf/guion_variables_condicionales.pdf', 'Implementación de estructuras de decisión simple y repetitiva.'),
        ('Arquitectura y Conectividad LAN', '6°', 'Redes de Computadoras', '2026-04-05', 'pdf/guion_redes_lan.pdf', 'Componentes de una red local, tipos de cableado y direccionamiento IP.'),
        ('Programación y Sensores Arduino', '6°', 'Robótica e IoT', '2026-05-12', 'pdf/guion_sensores_arduino.pdf', 'Lectura de entradas analógicas y digitales utilizando sensores.')
      `);
    }

    // 3. Generación Automática de Alumnos Demo (Requisito Nuevo)
    const [studRows] = await pool.query('SELECT COUNT(*) AS total FROM students');
    if (studRows[0].total === 0) {
      console.log('[DB-SEED] Tabla "students" vacía. Generando automáticamente 10 alumnos por curso (Total 80)...');
      const nombres = ['Valentina', 'Mateo', 'Camila', 'Santiago', 'Lucía', 'Benjamín', 'Isabella', 'Joaquín', 'Martina', 'Tomás', 'Sofía', 'Emiliano', 'Renata', 'Sebastián', 'Victoria', 'Nicolás', 'Emma', 'Daniel', 'Mía', 'Alejandro', 'Catalina', 'Thiago', 'Antonella', 'Máximo', 'Alma', 'Facundo', 'Olivia', 'Lautaro', 'Julieta', 'Agustín'];
      const apellidos = ['González', 'Rodríguez', 'Martínez', 'López', 'García', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Reyes', 'Romero', 'Herrera', 'Medina', 'Aguilar', 'Vargas', 'Castro', 'Ruiz', 'Jiménez', 'Mendoza', 'Silva'];
      const grados = ['5° A', '5° B', '5° C', '5° D', '6° A', '6° B', '6° C', '6° D'];

      let countInserted = 0;
      for (const grado of grados) {
        const usedNames = new Set();
        for (let i = 0; i < 10; i++) {
          let fullName;
          let attempts = 0;
          do {
            const nombre = nombres[Math.floor(Math.random() * nombres.length)];
            const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
            fullName = `${nombre} ${apellido}`;
            attempts++;
          } while (usedNames.has(fullName) && attempts < 50);
          usedNames.add(fullName);

          await pool.query('INSERT IGNORE INTO students (full_name, course) VALUES (?, ?)', [fullName, grado]);
          countInserted++;
        }
      }
      console.log(`[DB-SEED] Se sembraron con éxito ${countInserted} alumnos demo en total.`);
    }

    console.log('[DB-MySQL] Inicialización completada. Los datos existentes fueron preservados.');
  } catch (err) {
    console.error('[DB-MySQL] Error al inicializar tablas/datos semilla:', err.message);
  }
}

// ==========================================
// ENDPOINTS DE AUTENTICACIÓN (LOGIN & REGISTRO REDISEÑADOS)
// ==========================================

// 0. Verificar sesión y sincronizar rol actual desde la BD
app.get('/api/me', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const token = authHeader.split(' ')[1];
  const username = token.split(':')[0];

  try {
    const [rows] = await pool.query('SELECT id, username, name, email, role FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const user = rows[0];
    res.json({ user, token: `${user.username}:${user.role}` });
  } catch (err) {
    console.error('Error en GET /api/me:', err.message);
    res.status(500).json({ error: 'Error interno' });
  }
});

// 1. Registro de usuarios con username
app.post('/api/register', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (username.length < 3 || password.length < 4) {
      return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres y la contraseña al menos 4.' });
    }

    // Comprobar si el username ya existe
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
    }

    // Cifrar la contraseña e insertar
    const hashedPassword = hashPassword(password);
    await pool.query(
      'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, "user")',
      [username, name, email, hashedPassword]
    );

    console.log(`[AUTH] Nuevo usuario registrado: "${username}" (${email})`);
    res.status(201).json({ success: true, message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error('Error en POST /api/register:', err.message);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// 2. Inicio de sesión con username y password
app.post('/api/login', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const hashedPassword = hashPassword(password);

    // Buscar usuario
    const [rows] = await pool.query(
      'SELECT id, username, name, email, role, password FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0 || rows[0].password !== hashedPassword) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];

    // Crear un token de sesión estructurado como "username:role"
    const sessionToken = `${user.username}:${user.role}`;

    console.log(`[AUTH] Inicio de sesión exitoso: "${user.name}" (${user.role})`);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: sessionToken
    });
  } catch (err) {
    console.error('Error en POST /api/login:', err.message);
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
});

// ==========================================
// ENDPOINTS DE ADMINISTRACIÓN DE USUARIOS (PROTEGIDOS)
// ==========================================

// 3. Obtener lista completa de usuarios (Solo Admin)
app.get('/api/users', checkAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, name, email, role, created_at FROM users ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/users:', err.message);
    res.status(500).json({ error: 'Error al obtener el listado de usuarios' });
  }
});

// 4. Cambiar rol de un usuario (Solo Admin)
app.put('/api/users/:id/role', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (role !== 'user' && role !== 'admin') {
      return res.status(400).json({ error: 'Rol inválido. Debe ser "user" o "admin".' });
    }

    // Evitar que el administrador principal sea degradado
    const [targetUser] = await pool.query('SELECT username FROM users WHERE id = ?', [id]);
    if (targetUser.length > 0 && targetUser[0].username === 'admin' && role === 'user') {
      return res.status(400).json({ error: 'No es posible degradar el rol de la cuenta de administrador semilla.' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    console.log(`[ADMIN] Rol de usuario ID ${id} cambiado a "${role}" por "${req.adminUsername}"`);
    res.json({ success: true, message: `Rol del usuario actualizado a ${role} con éxito.` });
  } catch (err) {
    console.error('Error en PUT /api/users/:id/role:', err.message);
    res.status(500).json({ error: 'Error al actualizar el rol del usuario' });
  }
});


// ==========================================
// CRUD GALERÍA
// ==========================================

// GET - Obtener Galería con filtro por grado
app.get('/api/galeria', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { grade } = req.query;
    let query = 'SELECT * FROM galeria';
    const params = [];

    if (grade && grade !== 'all') {
      query += ' WHERE grade = ?';
      params.push(grade);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/galeria:', err.message);
    res.status(500).json({ error: 'Error al obtener la galería de imágenes' });
  }
});

// POST - Crear item de galería con subida de imagen (Solo Admin)
app.post('/api/galeria', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, grade, date } = req.body;
    let src;

    if (req.file) {
      // Imagen subida como archivo → guardar ruta relativa
      src = '/uploads/' + req.file.filename;
      console.log(`[UPLOAD] Imagen guardada: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    } else if (req.body.src) {
      // Alternativa: se envió una URL manualmente (compatibilidad)
      src = req.body.src;
    } else {
      return res.status(400).json({ error: 'Se requiere una imagen o URL de imagen.' });
    }

    const [result] = await pool.query(
      'INSERT INTO galeria (title, description, grade, date, src) VALUES (?, ?, ?, ?, ?)',
      [title, description, grade, date, src]
    );
    console.log(`[API] Nuevo item de galería creado (ID: ${result.insertId}) por "${req.adminUsername}"`);
    res.status(201).json({ success: true, id: result.insertId, src });
  } catch (err) {
    console.error('Error en POST /api/galeria:', err.message);
    res.status(500).json({ error: 'Error al crear el item de galería' });
  }
});

// Middleware para manejar errores de Multer (tamaño, tipo, etc.)
app.use('/api/galeria', (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'La imagen es demasiado grande. Máximo: 10 MB.' });
    }
    return res.status(400).json({ error: `Error de subida: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// DELETE - Eliminar item de galería y su archivo (Solo Admin)
app.delete('/api/galeria/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener la ruta de la imagen antes de eliminarla
    const [rows] = await pool.query('SELECT src FROM galeria WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].src && rows[0].src.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, rows[0].src);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[UPLOAD] Archivo eliminado del disco: ${rows[0].src}`);
      }
    }

    await pool.query('DELETE FROM galeria WHERE id = ?', [id]);
    console.log(`[API] Item de galería ID ${id} eliminado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Item de galería eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/galeria/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar el item de galería' });
  }
});

// PUT - Editar item de galería (actualizar imagen opcionalmente) (Solo Admin)
app.put('/api/galeria/:id', checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, grade, date } = req.body;

    // Verificar que existe
    const [existing] = await pool.query('SELECT * FROM galeria WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Item de galería no encontrado' });
    }

    let src = existing[0].src;

    // Si se sube una nueva imagen, reemplazar la anterior
    if (req.file) {
      // Eliminar archivo anterior si existe en uploads
      if (src && src.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, src);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log(`[UPLOAD] Archivo anterior eliminado: ${src}`);
        }
      }
      src = '/uploads/' + req.file.filename;
      console.log(`[UPLOAD] Nueva imagen guardada: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    }

    await pool.query(
      'UPDATE galeria SET title = ?, description = ?, grade = ?, date = ?, src = ? WHERE id = ?',
      [title || existing[0].title, description || existing[0].description, grade || existing[0].grade, date || existing[0].date, src, id]
    );

    console.log(`[API] Item de galería ID ${id} actualizado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Item de galería actualizado', src });
  } catch (err) {
    console.error('Error en PUT /api/galeria/:id:', err.message);
    res.status(500).json({ error: 'Error al actualizar el item de galería' });
  }
});

// ==========================================
// CRUD PROYECTOS
// ==========================================

// GET - Obtener Proyectos Scratch con filtro por grado
app.get('/api/proyectos', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { grade } = req.query;
    let query = 'SELECT * FROM proyectos';
    const params = [];

    if (grade && grade !== 'all') {
      query += ' WHERE grade = ?';
      params.push(grade);
    }

    query += ' ORDER BY id ASC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/proyectos:', err.message);
    res.status(500).json({ error: 'Error al obtener los proyectos de Scratch' });
  }
});

// (POST y DELETE de proyectos se definen más abajo con soporte de imágenes)

// POST - Crear proyecto con imagen subida (Solo Admin)
app.post('/api/proyectos', checkAdmin, upload.single('thumbnail_file'), async (req, res) => {
  try {
    const { title, author, grade, description, scratch_url } = req.body;
    let thumbnail = req.body.thumbnail || '';

    if (req.file) {
      thumbnail = '/uploads/' + req.file.filename;
      console.log(`[UPLOAD] Thumbnail guardado: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    }

    const [result] = await pool.query(
      'INSERT INTO proyectos (title, author, grade, description, scratch_url, thumbnail) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, grade, description, scratch_url, thumbnail]
    );
    console.log(`[API] Nuevo proyecto creado (ID: ${result.insertId}) por "${req.adminUsername}"`);
    res.status(201).json({ success: true, id: result.insertId, thumbnail });
  } catch (err) {
    console.error('Error en POST /api/proyectos:', err.message);
    res.status(500).json({ error: 'Error al crear el proyecto' });
  }
});

// DELETE - Eliminar proyecto y su thumbnail (Solo Admin)
app.delete('/api/proyectos/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Eliminar thumbnail del disco si existe
    const [rows] = await pool.query('SELECT thumbnail FROM proyectos WHERE id = ?', [id]);
    if (rows.length > 0 && rows[0].thumbnail && rows[0].thumbnail.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, rows[0].thumbnail);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[UPLOAD] Thumbnail eliminado del disco: ${rows[0].thumbnail}`);
      }
    }

    await pool.query('DELETE FROM proyectos WHERE id = ?', [id]);
    console.log(`[API] Proyecto ID ${id} eliminado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Proyecto eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/proyectos/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar el proyecto' });
  }
});

// PUT - Editar proyecto (actualizar thumbnail opcionalmente) (Solo Admin)
app.put('/api/proyectos/:id', checkAdmin, upload.single('thumbnail_file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, grade, description, scratch_url } = req.body;

    const [existing] = await pool.query('SELECT * FROM proyectos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    let thumbnail = existing[0].thumbnail;

    if (req.file) {
      // Eliminar thumbnail anterior si existe en uploads
      if (thumbnail && thumbnail.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, thumbnail);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
          console.log(`[UPLOAD] Thumbnail anterior eliminado: ${thumbnail}`);
        }
      }
      thumbnail = '/uploads/' + req.file.filename;
      console.log(`[UPLOAD] Nuevo thumbnail guardado: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    }

    await pool.query(
      'UPDATE proyectos SET title = ?, author = ?, grade = ?, description = ?, scratch_url = ?, thumbnail = ? WHERE id = ?',
      [title || existing[0].title, author || existing[0].author, grade || existing[0].grade, description || existing[0].description, scratch_url || existing[0].scratch_url, thumbnail, id]
    );

    console.log(`[API] Proyecto ID ${id} actualizado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Proyecto actualizado', thumbnail });
  } catch (err) {
    console.error('Error en PUT /api/proyectos/:id:', err.message);
    res.status(500).json({ error: 'Error al actualizar el proyecto' });
  }
});

// Middleware para manejar errores de Multer en proyectos
app.use('/api/proyectos', (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'La imagen es demasiado grande. Máximo: 10 MB.' });
    }
    return res.status(400).json({ error: `Error de subida: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ==========================================
// CRUD GUIONES
// ==========================================

// GET - Obtener Guiones con búsqueda y filtro por grado
app.get('/api/guiones', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { q, grade } = req.query;
    let query = 'SELECT * FROM guiones WHERE 1=1';
    const params = [];

    if (grade && grade !== 'all') {
      query += ' AND grade = ?';
      params.push(grade);
    }

    if (q) {
      query += ' AND (title LIKE ? OR description LIKE ? OR subject LIKE ?)';
      const searchPattern = `%${q}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/guiones:', err.message);
    res.status(500).json({ error: 'Error al obtener los guiones de clase' });
  }
});

// POST - Crear guión de clase con soporte de subida física (Solo Admin)
app.post('/api/guiones', checkAdmin, docUpload.single('file'), async (req, res) => {
  try {
    const { title, grade, subject, date, description } = req.body;
    let pdf_url;

    if (req.file) {
      pdf_url = '/uploads/' + req.file.filename;
      console.log(`[UPLOAD] Documento guardado: ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);
    } else if (req.body.pdf_url) {
      pdf_url = req.body.pdf_url;
    } else {
      return res.status(400).json({ error: 'Se requiere subir un archivo de documento o proveer una ruta válida.' });
    }

    const [result] = await pool.query(
      'INSERT INTO guiones (title, grade, subject, date, pdf_url, description) VALUES (?, ?, ?, ?, ?, ?)',
      [title, grade, subject, date, pdf_url, description]
    );
    console.log(`[API] Nuevo guión creado (ID: ${result.insertId}) por "${req.adminUsername}"`);
    res.status(201).json({ success: true, id: result.insertId, pdf_url });
  } catch (err) {
    console.error('Error en POST /api/guiones:', err.message);
    res.status(500).json({ error: 'Error al crear el guión de clase' });
  }
});

// Middleware para manejar errores de Multer en guiones
app.use('/api/guiones', (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo: 15 MB.' });
    }
    return res.status(400).json({ error: `Error de subida: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// DELETE - Eliminar guión de clase (Solo Admin)
app.delete('/api/guiones/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM guiones WHERE id = ?', [id]);
    console.log(`[API] Guión ID ${id} eliminado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Guión de clase eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/guiones/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar el guión de clase' });
  }
});


// ==========================================
// CRUD ESTUDIANTES Y ASISTENCIA (SISTEMA REDISEÑADO)
// ==========================================

// GET - Obtener todos los alumnos registrados
app.get('/api/students', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { course } = req.query;
    let query = 'SELECT * FROM students';
    const params = [];
    if (course && course !== 'all') {
      query += ' WHERE course = ?';
      params.push(course);
    }
    query += ' ORDER BY full_name ASC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/students:', err.message);
    res.status(500).json({ error: 'Error al obtener lista de alumnos' });
  }
});

// POST - Registrar un nuevo alumno (Solo Admin)
app.post('/api/students', checkAdmin, async (req, res) => {
  try {
    const { full_name, course } = req.body;
    if (!full_name || !course) {
      return res.status(400).json({ error: 'Nombre y curso son obligatorios' });
    }

    const [result] = await pool.query(
      'INSERT INTO students (full_name, course) VALUES (?, ?) ON DUPLICATE KEY UPDATE full_name=full_name',
      [full_name, course]
    );
    console.log(`[API] Nuevo alumno agregado: ${full_name} (${course}) por "${req.adminUsername}"`);
    res.status(201).json({ success: true, id: result.insertId || null });
  } catch (err) {
    console.error('Error en POST /api/students:', err.message);
    res.status(500).json({ error: 'Error al registrar el alumno' });
  }
});

// PUT - Editar alumno (Solo Admin)
app.put('/api/students/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, course } = req.body;
    if (!full_name || !course) {
      return res.status(400).json({ error: 'Nombre y curso son obligatorios' });
    }
    await pool.query('UPDATE students SET full_name = ?, course = ? WHERE id = ?', [full_name, course, id]);
    console.log(`[API] Alumno ID ${id} actualizado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Estudiante actualizado con éxito.' });
  } catch (err) {
    console.error('Error en PUT /api/students/:id:', err.message);
    res.status(500).json({ error: 'Error al actualizar estudiante' });
  }
});

// DELETE - Eliminar alumno (Solo Admin)
app.delete('/api/students/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    console.log(`[API] Alumno ID ${id} eliminado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Alumno eliminado con éxito del sistema' });
  } catch (err) {
    console.error('Error en DELETE /api/students/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
});

// GET - Obtener Asistencia con buscador, filtros y estadísticas por fecha y curso
app.get('/api/asistencia', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { q, grade, date, sortBy, order } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Se requiere una fecha para consultar asistencia.' });
    }

    // Buscamos todos los alumnos según el curso seleccionado
    let studentQuery = 'SELECT id, full_name, course FROM students WHERE 1=1';
    const studParams = [];
    if (grade && grade !== 'all') {
      studentQuery += ' AND course = ?';
      studParams.push(grade);
    }
    if (q) {
      studentQuery += ' AND full_name LIKE ?';
      studParams.push(`%${q}%`);
    }

    const [studentsList] = await pool.query(studentQuery, studParams);

    if (studentsList.length === 0) {
      return res.json({ records: [], stats: { total: 0, presentes: 0, ausentes: 0 } });
    }

    // Por cada alumno en la lista, aseguramos que exista una fila de asistencia para esa fecha.
    // Si no existe, la creamos como 'Ausente' por defecto (previniendo inserción si ya existe).
    for (const student of studentsList) {
      await pool.query(
        'INSERT IGNORE INTO attendance (student_id, date, status) VALUES (?, ?, ?)',
        [student.id, date, 'Ausente']
      );
    }

    // Ahora traemos la asistencia completa de este curso/fecha con su porcentaje general de asistencia
    let query = `
      SELECT 
        s.id AS student_id,
        s.full_name AS student,
        s.course AS grade,
        a.id AS id,
        a.date AS date,
        a.status AS status,
        (
          SELECT ROUND(COUNT(CASE WHEN att2.status = 'Presente' THEN 1 END) * 100.0 / COUNT(*))
          FROM attendance att2
          WHERE att2.student_id = s.id
        ) AS attendance_percentage
      FROM students s
      JOIN attendance a ON s.id = a.student_id AND a.date = ?
      WHERE 1=1
    `;
    const params = [date];

    if (grade && grade !== 'all') {
      query += ' AND s.course = ?';
      params.push(grade);
    }
    if (q) {
      query += ' AND s.full_name LIKE ?';
      params.push(`%${q}%`);
    }

    const allowedSortColumns = ['student', 'grade', 'date', 'status', 'attendance_percentage'];
    let sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'student';
    if (sortColumn === 'student') sortColumn = 's.full_name';
    if (sortColumn === 'grade') sortColumn = 's.course';
    if (sortColumn === 'status') sortColumn = 'a.status';
    
    const sortOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    const [rows] = await pool.query(query, params);

    // Calcular estadísticas generales para el curso y fecha seleccionada
    let statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Presente' THEN 1 END) as presentes,
        COUNT(CASE WHEN status = 'Ausente' THEN 1 END) as ausentes,
        0 as tardanzas
      FROM attendance a
      JOIN students s ON s.id = a.student_id
      WHERE a.date = ?
    `;
    const statsParams = [date];

    if (grade && grade !== 'all') {
      statsQuery += ' AND s.course = ?';
      statsParams.push(grade);
    }
    if (q) {
      statsQuery += ' AND s.full_name LIKE ?';
      statsParams.push(`%${q}%`);
    }

    const [statsRows] = await pool.query(statsQuery, statsParams);

    res.json({
      records: rows,
      stats: statsRows[0] || { total: 0, presentes: 0, ausentes: 0, tardanzas: 0 }
    });
  } catch (err) {
    console.error('Error en GET /api/asistencia:', err.message);
    res.status(500).json({ error: 'Error al obtener el registro de asistencia' });
  }
});

// POST - Crear o actualizar asistencia de un alumno (Guardar/Modificar directo)
app.post('/api/asistencia', checkAdmin, async (req, res) => {
  try {
    const { student, grade, date, status } = req.body;
    
    // Primero resolver student_id basándonos en el nombre y curso
    const [studRows] = await pool.query('SELECT id FROM students WHERE full_name = ? AND course = ?', [student, grade]);
    if (studRows.length === 0) {
      return res.status(404).json({ error: 'Estudiante no encontrado en el curso especificado.' });
    }
    
    const studentId = studRows[0].id;
    const [result] = await pool.query(
      'INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
      [studentId, date, status, status]
    );
    console.log(`[API] Registro de asistencia guardado/actualizado para ${student} (ID: ${studentId}) en fecha ${date} por "${req.adminUsername}"`);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error en POST /api/asistencia:', err.message);
    res.status(500).json({ error: 'Error al registrar la asistencia' });
  }
});

// DELETE - Eliminar registro de asistencia (Solo Admin)
app.delete('/api/asistencia/:id', checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
    console.log(`[API] Registro de asistencia ID ${id} eliminado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Registro de asistencia eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/asistencia/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar el registro de asistencia' });
  }
});

// POST - Cargar alumnos aleatorios para demo (Solo Admin)
app.post('/api/alumnos/seed-random', checkAdmin, async (req, res) => {
  try {
    const nombres = ['Valentina', 'Mateo', 'Camila', 'Santiago', 'Lucía', 'Benjamín', 'Isabella', 'Joaquín', 'Martina', 'Tomás', 'Sofía', 'Emiliano', 'Renata', 'Sebastián', 'Victoria', 'Nicolás', 'Emma', 'Daniel', 'Mía', 'Alejandro', 'Catalina', 'Thiago', 'Antonella', 'Máximo', 'Alma', 'Facundo', 'Olivia', 'Lautaro', 'Julieta', 'Agustín'];
    const apellidos = ['González', 'Rodríguez', 'Martínez', 'López', 'García', 'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Reyes', 'Romero', 'Herrera', 'Medina', 'Aguilar', 'Vargas', 'Castro', 'Ruiz', 'Jiménez', 'Mendoza', 'Silva'];
    const grados = ['5° A', '5° B', '5° C', '5° D', '6° A', '6° B', '6° C', '6° D'];

    let inserted = 0;
    for (const grado of grados) {
      const usedNames = new Set();
      for (let i = 0; i < 10; i++) {
        let fullName;
        let attempts = 0;
        do {
          const nombre = nombres[Math.floor(Math.random() * nombres.length)];
          const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
          fullName = `${nombre} ${apellido}`;
          attempts++;
        } while (usedNames.has(fullName) && attempts < 50);
        usedNames.add(fullName);

        try {
          await pool.query(
            'INSERT IGNORE INTO students (full_name, course) VALUES (?, ?)',
            [fullName, grado]
          );
          inserted++;
        } catch (e) {
          // Ignorar duplicados
        }
      }
    }

    console.log(`[API] ${inserted} alumnos aleatorios de demostración sembrados por "${req.adminUsername}"`);
    res.status(201).json({ success: true, message: `${inserted} alumnos cargados en el sistema de demostración.`, count: inserted });
  } catch (err) {
    console.error('Error en POST /api/alumnos/seed-random:', err.message);
    res.status(500).json({ error: 'Error al cargar alumnos aleatorios' });
  }
});

// ==========================================
// CONTACTO
// ==========================================

// POST - Enviar mensaje de contacto (Guardar en Base de Datos MySQL)
app.post('/api/contacto', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const [result] = await pool.query(
      'INSERT INTO mensajes_contacto (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject, message]
    );

    console.log(`[API-MySQL] Mensaje de contacto guardado en DB de ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Tu mensaje fue recibido y guardado con éxito en phpMyAdmin.',
      data: {
        id: result.insertId,
        name,
        email,
        subject,
        message
      }
    });
  } catch (err) {
    console.error('Error en POST /api/contacto:', err.message);
    res.status(500).json({ error: 'Error al guardar el mensaje de contacto en la base de datos' });
  }
});

// GET - Obtener todos los mensajes de contacto (Solo Admin)
app.get('/api/contacto', checkAdmin, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const [rows] = await pool.query('SELECT * FROM mensajes_contacto ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error en GET /api/contacto:', err.message);
    res.status(500).json({ error: 'Error al obtener los mensajes de contacto' });
  }
});

// DELETE - Eliminar un mensaje de contacto por ID (Solo Admin)
app.delete('/api/contacto/:id', checkAdmin, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM mensajes_contacto WHERE id = ?', [id]);
    console.log(`[API] Mensaje de contacto ID ${id} eliminado por "${req.adminUsername}"`);
    res.json({ success: true, message: 'Mensaje de contacto eliminado' });
  } catch (err) {
    console.error('Error en DELETE /api/contacto/:id:', err.message);
    res.status(500).json({ error: 'Error al eliminar el mensaje de contacto' });
  }
});

// ==========================================
// ESTADÍSTICAS PÚBLICAS (CONTADORES DEL HERO)
// ==========================================

app.get('/api/stats', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Base de datos no conectada' });
  try {
    const [[proyectos]] = await pool.query('SELECT COUNT(*) AS total FROM proyectos');
    const [[alumnos]] = await pool.query('SELECT COUNT(*) AS total FROM students');
    const [[guiones]] = await pool.query('SELECT COUNT(*) AS total FROM guiones');
    const [[fotos]] = await pool.query('SELECT COUNT(*) AS total FROM galeria');
    res.json({
      proyectos: proyectos.total,
      alumnos: alumnos.total,
      guiones: guiones.total,
      fotos: fotos.total
    });
  } catch (err) {
    console.error('Error en GET /api/stats:', err.message);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});


// Levantar el servidor
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SERVIDOR CORRIENDO EN EL PUERTO: http://localhost:${PORT}`);
  console.log(`=======================================================`);
  initializeDatabase();
});
