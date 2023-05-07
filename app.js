const express = require('express')
const app = express()
const port = 3000
const bcryptjs = require('bcryptjs');

app.set('view engine', 'ejs')

const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

const connection = require('./database/db');


app.get('/', (req, res) => {
  connection.query('SELECT * FROM productos WHERE categoria IN ("Electrico", "Percusion", "Pianos y teclados", "Viento")', function (error, productos) {
    if (error) {
      throw error;
    } else {
      const electricos = productos.filter(producto => producto.categoria === 'Electrico');
      const percusion = productos.filter(producto => producto.categoria === 'Percusion');
      const pianos = productos.filter(producto => producto.categoria === 'Pianos y teclados');
      const viento = productos.filter(producto => producto.categoria === 'Viento');
      res.render('index.ejs', { electricos, percusion, pianos, viento });
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login')
})
////////
//REGISTRO//
app.get('/registro', (req, res) => {
  res.render('registro')
})

app.use(express.urlencoded({ extended: true }));

app.post('/registro', async (req, res) => {
  const { user, correo, phone, rut, pass } = req.body;
  console.log(user, correo, phone, rut, pass)
  // Validación de entrada
  if (!user || !correo || !phone || !rut || !pass) {
    return res.status(400).send('Datos de usuario incompletos');
  }

  // Inserción en la base de datos
  connection.query('INSERT INTO usuarios SET ?', { user, correo, telefono: phone, rut, pass }, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      res.render('registro', {
        alert: true,
        alertTitle: "Registration",
        alertMessage: "¡Successful Registration!",
        alertIcon: 'success',
        showConfirmButton: false,
        timer: 1500,
        ruta: ''
      });
      //res.redirect('/');         
    }
  });
})
//FIN DEL REGISTRO//

//LOGIN
app.post('/', async (req, res) => {
  const user = req.body.user;
  const pass = req.bosy.pass;
  if (user && pass) {
    connection.query('SELECT * FROM usuarios WHERE user = ?', [user], async (error, results) => {
      if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
        res.render('login', {
          alert: true,
          alertTitle: "Error",
          alertMessage: "USUARIO y/o PASSWORD incorrectas",
          alertIcon: 'error',
          showConfirmButton: true,
          timer: false,
          ruta: 'login'
        });
        //Mensaje simple y poco vistoso
        //res.send('Incorrect Username and/or Password!');				
      } else {
        //creamos una var de session y le asignamos true si INICIO SESSION       
        req.session.loggedin = true;
        req.session.name = results[0].name;
        res.render('login', {
          alert: true,
          alertTitle: "Conexión exitosa",
          alertMessage: "¡LOGIN CORRECTO!",
          alertIcon: 'success',
          showConfirmButton: false,
          timer: 1500,
          ruta: ''
        });
      }
      res.end();
    });
  } else {
    res.send('Please enter user and Password!');
    res.end();
  }
});
/////LOGIN TERMINADO

app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

// Ruta de error 404
app.use(function (req, res, next) {
  res.status(404);
  res.render('error.ejs', { title: '404 - Not Found', message: 'Oops! Page not found.' });
});


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:3000/`)
})