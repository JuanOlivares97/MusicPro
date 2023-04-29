const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs')

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

const connection = require('./database/db'); 


app.get('/', (req, res) => {
    connection.query('SELECT * FROM productos WHERE categoria IN ("Electrico", "Percusion", "Pianos y teclados", "Viento")', function(error, productos) {
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

app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname+'/public'));

// Ruta de error 404
app.use(function(req, res, next) {
  res.status(404);
  res.render('error.ejs', { title: '404 - Not Found', message: 'Oops! Page not found.' });
});


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:3000/`)
})