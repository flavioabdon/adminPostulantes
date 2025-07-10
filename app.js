const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); 

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: 'tu_secreto_super_seguro',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(flash());

// Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para variables globales
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg');
    res.locals.user = req.session.user || null;
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));  

// Rutas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/users', userRoutes);

// Iniciar servidor en todas las interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Accesible en la red local en: http://[tu-ip-local]:${port}`);
  
  // Opcional: Mostrar las interfaces de red disponibles
  const os = require('os');
  const interfaces = os.networkInterfaces();
  
  console.log('\nDirecciones IP disponibles:');
  Object.keys(interfaces).forEach(iface => {
    interfaces[iface].forEach(details => {
      if (details.family === 'IPv4' && !details.internal) {
        console.log(`- http://${details.address}:${port}`);
      }
    });
  });
});