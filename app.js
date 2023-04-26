const express = require('express')
const app = express()
const port = 3000

app.set('view engine', 'ejs')

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

const connection = require('./database/db'); 

app.get('/', (req, res) => {
  connection.query('SELECT * FROM productos WHERE categoria IN ("Electrico", "Percusion")', function(error, productos) {
    if (error) {
      throw error;
    } else {
      const electricos = productos.filter(producto => producto.categoria === 'Electrico');
      const percusion = productos.filter(producto => producto.categoria === 'Percusion');
      res.render('index.ejs', { electricos, percusion });
      console.log(productos);
    }
  });
});

app.get('/login', (req, res) => {
  res.render('login')
})

app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname+'/public'));

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:3000/`)
})