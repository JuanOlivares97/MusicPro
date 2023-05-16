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
// Generar un token
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
            const decoded = jwt.verify(req.cookies.token, "secret"); // Reemplaza 'secreto' con tu propia clave secreta
            const user = decoded.user;
            const correo = decoded.correo;
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

app.get("/login", (req, res) => {
  res.render("login", {
    login: false,
    name: "Iniciar Sesión",
  });
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
            ciudad: user.ciudad,
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
  console.log(totalCompra);
  const id = req.session.idUser;
  //Realizar la inserción en la base de datos
  const query = 'INSERT INTO `compra`(`total`, `cliente_id`) VALUES (?,?)';
  if(req.session.idUser){
    connection.query(query, [totalCompra, id], function(err, result) {
      if (err) {
        console.error('Error al ingresar los datos en la base de datos:', err);
        res.status(500).json({ error: 'Error al ingresar los datos' });
      } else {
        console.log('Datos ingresados correctamente');
        res.status(200).json({ message: 'Datos ingresados correctamente' });
      }
    });
  } else {
    connection.query(query, [totalCompra, 1], function(err, result) {
      if (err) {
        console.error('Error al ingresar los datos en la base de datos:', err);
        res.status(500).json({ error: 'Error al ingresar los datos' });
      } else {
        console.log('Datos ingresados correctamente');
        res.status(200).json({ message: 'Datos ingresados correctamente' });
      }
    });
  }
});


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
