const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jua.olivares97@gmail.com', // Dirección de correo electrónico desde la que se enviará el mensaje
    pass: 'kzcdporiudsjjukn' // Contraseña de la cuenta de correo electrónico
  }
});
const cors = require("cors")
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
app.set("view engine", "ejs");
const dotenv = require("dotenv");
dotenv.config({ path: "./env/.env" });
const connection = require("./database/db");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const transbankRoute = require('./routes/transbankRoutes.js')
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(cors())


//LOGIN
app.post("/auth", (req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;

  if (user && pass) {
    connection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [user],
      (error, results) => {
        if (error) {
          res.render("login", {
            alert: true,
            alertTitle: "Error",
            alertMessage: "Ha ocurrido un error en la base de datos",
            alertIcon: "error",
            showConfirmButton: true,
            timer: false,
            ruta: "login",
          });
        } else {
          if (results.length === 0 || results[0].pass !== pass) {
            res.render("login", {
              alert: true,
              alertTitle: "Error",
              alertMessage: "USUARIO y/o PASSWORD incorrectas",
              alertIcon: "error",
              showConfirmButton: true,
              timer: false,
              ruta: "login",
            });
          } else {
            const user = results[0].user;
            const correo = results[0].correo;
            const idUser = results[0].id;
            req.session.loggedin = true;
            req.session.user = user;
            req.session.correo = correo;
            req.session.idUser = idUser;
            console.log(idUser);
            const token = jwt.sign({ user }, "secret"); // Reemplaza 'secreto' con tu propia clave secreta
            // Establecer el token en una cookie
            res.cookie("token", token, { httpOnly: true });
            res.redirect("/checkout-user");
          }
        }
      }
    );
  } else {
    res.render("login", {
      alert: true,
      alertTitle: "Error",
      alertMessage: "Por favor, ingrese usuario y contraseña",
      alertIcon: "error",
      showConfirmButton: true,
      timer: false,
      ruta: "login",
    });
  }
});
app.get("/login", (req, res) => {
  res.render("login", {
    login: false,
    name: "Iniciar Sesión",
  });
});
//INDEX
app.get("/", (req, res) => {
  connection.query(
    'SELECT * FROM productos WHERE categoria IN ("Electrico", "Percusion", "Pianos y teclados", "Viento")',
    function (error, productos) {
      if (error) {
        res.render("error", { message: "Error al cargar los productos" });
      } else {
        const electricos = productos.filter(
          (producto) => producto.categoria === "Electrico"
        );
        const percusion = productos.filter(
          (producto) => producto.categoria === "Percusion"
        );
        const pianos = productos.filter(
          (producto) => producto.categoria === "Pianos y teclados"
        );
        const viento = productos.filter(
          (producto) => producto.categoria === "Viento"
        );

        if (req.cookies.token) {
          try {
            const user = req.session.user;
            res.render("index.ejs", {
              electricos,
              percusion,
              pianos,
              viento,
              login: true,
              name: user,
            });
          } catch (error) {
            res.render("index.ejs", {
              electricos,
              percusion,
              pianos,
              viento,
              login: false,
              name: "Iniciar Sesión",
            });
          }
        } else {
          res.render("index.ejs", {
            electricos,
            percusion,
            pianos,
            viento,
            login: false,
            name: "Iniciar Sesión",
          });
        }
      }
    }
  );
});

//REGISTRO//
app.get("/registro", (req, res) => {
  res.render("registro");
});

app.post("/registro", async (req, res) => {
  const { user, correo, phone, rut, pass } = req.body;
  console.log(user, correo, phone, rut, pass);
  // Validación de entrada
  if (!user || !correo || !phone || !rut || !pass) {
    return res.status(400).send("Datos de usuario incompletos");
  }

  // Inserción en la base de datos
  connection.query(
    "INSERT INTO usuarios SET ?",
    { user, correo, telefono: phone, rut, pass },
    (error, result) => {
      if (error) {
        console.log(error);
      } else {
        res.render("registro", {
          alert: true,
          alertTitle: "Registration",
          alertMessage: "¡Successful Registration!",
          alertIcon: "success",
          showConfirmButton: false,
          timer: 1500,
          ruta: "",
        });
        //res.redirect('/');
      }
    }
  );
});

app.get("/checkout-user", (req, res) => {
  if (req.session.loggedin) {
    const correo = req.session.correo; // Obtén el ID o identificador del usuario desde la sesión
    connection.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo],
      (error, results) => {
        if (error) {
          console.log(error);
          res.render("error", {
            message: "Error al obtener los datos del usuario",
          });
        } else {
          const user = results[0]; // Obtiene el primer resultado de la consulta (asumiendo que el ID del usuario es único)
          res.render("checkout", {
            login: true,
            name: user, // Muestra el nombre del usuario en el HTML
            // Puedes acceder a otros campos del usuario y pasarlos al objeto de contexto para utilizarlos en el HTML
            apellido: user.apellido,
            email: user.correo,
            telefono: user.telefono,
            rut: user.rut,
            direccion: user.direccion,
            ciudad: user.ciudad
          });
        }
      }
    );
  } else {
    res.render("login", {
      login: false,
      name: "Iniciar Sesión",
    });
  }
});

app.get("/checkout-invite", (req, res) => {
  res.render("checkout", {
    login: false,
    name: "Invitado", // Muestra el nombre del usuario en el HTML
    // Puedes acceder a otros campos del usuario y pasarlos al objeto de contexto para utilizarlos en el HTML
    apellido: "",
    email: "",
    telefono: "",
    rut: "",
    direccion: "",
    ciudad: "",
  });
});

app.get("/logout", (req, res) => {
  // Elimina la sesión y la cookie de token
  req.session.destroy();
  res.clearCookie("token");
  res.redirect("/login"); // Redirige a la página de inicio de sesión
});

app.post('/guardar-carrito', (req, res) => {
  // Obtener los datos de la solicitud
  const totalCompra = req.body.totalCompra;
  const idCliente = req.session.idUser;
  const productos = req.body.productos;
  const nombre= req.body.nombre;
  const apellido= req.body.apellido;
  const correo= req.body.correo;
  const direccion= req.body.direccion;
  const ciudad= req.body.ciudad;
  const telefono= req.body.telefono;
  const tipoPago = req.body.tipoPago;
  
  // Realizar la inserción en la tabla "compra"
  const queryCompra = 'INSERT INTO `compra`(`total`, `cliente_id`, `NombreCliente`, `ApellidoCliente`, `CorreoElectronico`, `Direccion`, `Ciudad`, `Telefono`,`tipoPago`) VALUES (?,?,?,?,?,?,?,?,?)';
  connection.query(queryCompra, [totalCompra, idCliente, nombre, apellido, correo, direccion, ciudad, telefono, tipoPago], function (err, resultCompra) {
    if (err) {
      console.error('Error al ingresar los datos en la tabla "compra":', err);
      res.status(500).json({ error: 'Error al ingresar los datos' });
    } else {
      const compraId = resultCompra.insertId; // Obtener el ID de la compra insertada
      console.log('Datos de compra ingresados correctamente. ID de compra:', compraId);

      // Recorrer los productos y realizar la inserción en la tabla "detalle compra"
      const queryDetalleCompra = 'INSERT INTO `detalle_compra`(`compra_id`, `referencia`, `producto_nombre`, `precio`, `cantidad`) VALUES (?, ?, ?, ?, ?)';
      productos.forEach(function (producto) {
        const { referencia, nombreProducto, precioProducto, cantidad } = producto;
        connection.query(queryDetalleCompra, [compraId, referencia, nombreProducto, precioProducto, cantidad], function (err, resultDetalleCompra) {
          if (err) {
            console.error('Error al ingresar los datos en la tabla "detalle compra":', err);
          } else {
            console.log('Datos de detalle compra ingresados correctamente');
          }
        });
      });
      productos.forEach(function (producto) {
        const { referencia, cantidad } = producto;
        console.log(referencia, cantidad);
        const queryActualizarStock = 'UPDATE `productos` SET `stock` = `stock` - ? WHERE `referencia` = ?';
        connection.query(queryActualizarStock, [cantidad, referencia], function (err, resultActualizarStock) {
          if (err) {
            console.error('Error al actualizar el stock del producto:', err);
          } else {
            console.log('Stock actualizado correctamente');
          }
        });
      });
      res.status(200).json({ message: 'Datos ingresados correctamente' });
    }
  });
  const mailOptions = {
    from: 'jua.olivares97@gmail.com', // Dirección de correo electrónico del remitente
    to: correo, // Dirección de correo electrónico del destinatario
    subject: '!Pedido Realizado!', // Asunto del correo
    html: `
    <h2>Detalles de Transferencia Bancaria</h2>
    <p>A continuación se muestran los detalles de la transferencia bancaria a la cuenta corriente de Falabella:</p>
    <table>
      <tr>
        <th>Banco Destinatario:</th>
        <td>Banco Falabella</td>
      </tr>
      <tr>
        <th>Número de Cuenta:</th>
        <td>1234567890</td>
      </tr>
      <tr>
        <th>Rut del Titular:</th>
        <td>12.345.678-9</td>
      </tr>
      <tr>
        <th>Nombre del Titular:</th>
        <td>Nombre del Titular</td>
      </tr>
      <tr>
        <th>Monto a Transferir:</th>
        <td>$${totalCompra}</td>
      </tr>
    </table>
    <p>Por favor, asegúrate de realizar la transferencia por el monto exacto y verificar los datos antes de realizar la transacción.</p>
    <p>¡Gracias por tu atención!</p>
  ` // Contenido del correo en formato de texto sin formato
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
});


app.use('/tbnk',transbankRoute)

app.use("/resources", express.static("public"));
app.use("/resources", express.static(__dirname + "/public"));

// Ruta de error 404
app.use(function (req, res, next) {
  res.status(404);
  res.render("error.ejs", {
    title: "404 - Not Found",
    message: "Oops! Page not found.",
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:3000/`);
});
