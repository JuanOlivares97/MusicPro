const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})
app.get('/login', (req, res) => {
  res.render('login')
})


app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname+'/public'));

app.listen(port, () => {
  console.log(`Example app listening on port https://localhost:3000/`)
})