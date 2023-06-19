function agregarAlCarrito(ref, nombre, precio, img) {
  // Obtén los productos del carrito del almacenamiento local
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Verificar si el producto ya existe en el carrito
  var productoExistente = carrito.find(function (producto) {
    return producto.nombre === nombre;
  });

  if (productoExistente) {
    // Si el producto existe, incrementa la cantidad y actualiza el precio total
    productoExistente.cantidad++;
    productoExistente.precioTotal =
      productoExistente.cantidad * productoExistente.precio;
  } else {
    // Si el producto no existe, crea un nuevo objeto con los datos del producto
    var producto = {
      referencia: ref,
      nombre: nombre,
      precio: parseFloat(precio),
      img: img,
      cantidad: 1,
      precioTotal: parseFloat(precio), // Precio total inicialmente igual al precio unitario
    };

    // Agrega el producto al carrito
    carrito.push(producto);
  }

  // Muestra la alerta de éxito
  new swal({
    title: "Producto agregado",
    text: "El producto se ha añadido al carrito.",
    icon: "success",
    button: "Aceptar",
    customClass: {
      confirmButton: "swal-button swal-button--danger",
    },
  });

  // Guarda los productos del carrito actualizados en el almacenamiento local
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Actualiza la vista del carrito
  actualizarCarritoView();

  // Recalcula el subtotal y lo muestra
  calcularSubtotal();
}

function actualizarCarritoView() {
  // Obtén la referencia al elemento donde se mostrará el carrito
  var carritoDiv = document.getElementById("carritoItems");
  carritoDiv.innerHTML = "";

  // Obtén los productos del carrito del almacenamiento local
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Recorre los productos del carrito y muéstralos en la lista
  carrito.forEach(function (producto, index) {
    var productoDiv = document.createElement("div");
    productoDiv.classList.add("product-widget");

    // Agregar la imagen al div con la clase "product-img"
    var imagen = document.createElement("img");
    imagen.src = producto.img; // Asigna la URL de la imagen desde la base de datos
    imagen.alt = "Product Image";
    var productImgDiv = document.createElement("div");
    productImgDiv.classList.add("product-img");
    productImgDiv.appendChild(imagen);
    productoDiv.appendChild(productImgDiv);

    // Agregar el contenido del producto al div con la clase "product-body"
    var productBodyDiv = document.createElement("div");
    productBodyDiv.classList.add("product-body");
    var productName = document.createElement("h3");
    productName.classList.add("product-name");
    var productNameLink = document.createElement("a");
    productNameLink.href = "#";
    productNameLink.textContent = producto.nombre;
    productName.appendChild(productNameLink);
    var productPrice = document.createElement("h4");
    productPrice.classList.add("product-price");
    var qtySpan = document.createElement("span");
    qtySpan.classList.add("qty");
    qtySpan.textContent = producto.cantidad + "x";
    var priceSpan = document.createElement("span");
    priceSpan.textContent = "$" + producto.precioTotal.toFixed(2);
    productPrice.appendChild(qtySpan);
    productPrice.appendChild(priceSpan);
    productBodyDiv.appendChild(productName);
    productBodyDiv.appendChild(productPrice);
    productoDiv.appendChild(productBodyDiv);

    // Agregar el botón de eliminar
    var deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    var deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa", "fa-close");
    deleteButton.appendChild(deleteIcon);
    // Agregar un evento click al botón de eliminar para eliminar el producto del carrito
    deleteButton.addEventListener("click", function () {
      eliminarDelCarrito(index);
    });
    productoDiv.appendChild(deleteButton);

    carritoDiv.appendChild(productoDiv);
  });

  // Actualiza la cantidad de productos en el elemento <small>
  var cantidadProductos = carrito.length;
  var smallElement = document.querySelector(".cart-summary small");
  smallElement.textContent =
    cantidadProductos + (cantidadProductos === 1 ? " Item" : " Items");

  // Actualiza la cantidad de productos en el elemento <div class="qty">
  var qtyElement = document.querySelector(".qty");
  qtyElement.textContent = cantidadProductos;
}

function llenarOrderSummary() {
  var orderSummaryDiv = document.getElementsByClassName("order-products")[0];
  orderSummaryDiv.innerHTML = "";

  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  var total = 0;
  var cantidadArticulos = 0;

  carrito.forEach(function (producto) {
    var orderColDiv = document.createElement("div");
    orderColDiv.classList.add("order-col");

    var productNameDiv = document.createElement("div");
    productNameDiv.textContent = producto.cantidad + "x " + producto.nombre;

    var productTotalDiv = document.createElement("div");
    productTotalDiv.textContent = "$" + producto.precioTotal.toFixed(2);

    orderColDiv.appendChild(productNameDiv);
    orderColDiv.appendChild(productTotalDiv);

    orderSummaryDiv.appendChild(orderColDiv);

    total += producto.precioTotal;
    cantidadArticulos += producto.cantidad;
  });

  var descuento = 0;
  if (cantidadArticulos >= 4) {
    descuento = 0.2;
  }
  
  var totalConDescuento = total - total * descuento;
  var orderTotalDiscountDiv = document.querySelector(".order-total-discount");
  orderTotalDiscountDiv.textContent = "$" + totalConDescuento.toFixed(2);
}

function llenarOrderSummaryInvitado() {
  var orderSummaryDiv = document.getElementsByClassName("order-products")[0];
  orderSummaryDiv.innerHTML = "";

  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  var total = 0;

  carrito.forEach(function (producto) {
    var orderColDiv = document.createElement("div");
    orderColDiv.classList.add("order-col");

    var productNameDiv = document.createElement("div");
    productNameDiv.textContent = producto.cantidad + "x " + producto.nombre;

    var productTotalDiv = document.createElement("div");
    productTotalDiv.textContent = "$" + producto.precioTotal.toFixed(2);

    orderColDiv.appendChild(productNameDiv);
    orderColDiv.appendChild(productTotalDiv);

    orderSummaryDiv.appendChild(orderColDiv);

    total += producto.precioTotal;
  });
  
  var orderTotalDiv = document.getElementsByClassName("order-total")[0];
  orderTotalDiv.textContent = "$" + total.toFixed(2);
}

function eliminarDelCarrito(index) {
  // Obtén los productos del carrito del almacenamiento local
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Elimina el producto del carrito usando el índice proporcionado
  carrito.splice(index, 1);

  // Guarda los productos del carrito actualizados en el almacenamiento local
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Actualizar la vista del carrito y el subtotal
  actualizarCarritoView();
  calcularSubtotal();
}

function calcularSubtotal() {
  // Obtén los productos del carrito del almacenamiento local
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  // Calcula el subtotal sumando los precios de los productos
  var subtotal = carrito.reduce(function (total, producto) {
    return total + producto.precioTotal;
  }, 0);
  console.log(subtotal);
  // Muestra el subtotal en el elemento con clase "cart-summary"
  var cartSummary = document.querySelector(".cart-summary");
  var subtotalElement = cartSummary.querySelector("h5");
  subtotalElement.textContent = "SUBTOTAL: $" + subtotal.toFixed(2);
}

function limpiarCarrito() {
  localStorage.removeItem("carrito");
}

function guardarCarritoUser() {
  var nombre = document.getElementsByName("nombre")[0].value;
  var apellido = document.getElementsByName("apellido")[0].value;
  var correo = document.getElementsByName("correo")[0].value;
  var direccion = document.getElementsByName("direccion")[0].value;
  var ciudad = document.getElementsByName("ciudad")[0].value;
  var telefono = document.getElementsByName("telefono")[0].value;
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  var subtotal = carrito.reduce(function (total, producto) {
    return total + producto.precioTotal;
  }, 0);
  console.log(carrito);
  const productos = carrito.map(function (producto) {
    return {
      referencia: producto.referencia,
      nombreProducto: producto.nombre,
      precioProducto: producto.precio,
      cantidad: producto.cantidad,
    };
  });

  const descuento =
    productos.reduce(function (total, producto) {
      return total + producto.cantidad;
    }, 0) > 4
      ? 0.2
      : 0;

  const totalConDescuento = subtotal - subtotal * descuento;

  const data = {
    totalCompra: totalConDescuento,
    productos: productos,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    direccion: direccion,
    ciudad: ciudad,
    telefono: telefono,
  };
  console.log(data);
  // Configuración de la solicitud
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  // Realizar la solicitud
  fetch("/guardar-carrito", options)
    .then((response) => response.json())
    .then((data) => {
      // Manejar la respuesta
      console.log(data);
    })
    .catch((error) => {
      // Manejar el error
      console.error(error);
    });

  limpiarCarrito();
  window.location.href = "http://localhost:3000/tbnk/transbank?amount="+subtotal;
};

function guardarCarrito() {
  var nombre = document.getElementsByName("nombre")[0].value;
  var apellido = document.getElementsByName("apellido")[0].value;
  var correo = document.getElementsByName("correo")[0].value;
  var direccion = document.getElementsByName("direccion")[0].value;
  var ciudad = document.getElementsByName("ciudad")[0].value;
  var telefono = document.getElementsByName("telefono")[0].value;
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  var subtotal = carrito.reduce(function (total, producto) {
    return total + producto.precioTotal;
  }, 0);
  console.log(carrito);
  const productos = carrito.map(function (producto) {
    return {
      referencia: producto.referencia,
      nombreProducto: producto.nombre,
      precioProducto: producto.precio,
      cantidad: producto.cantidad,
    };
  });
  const data = {
    totalCompra: subtotal,
    productos: productos,
    nombre: nombre,
    apellido: apellido,
    correo: correo,
    direccion: direccion,
    ciudad: ciudad,
    telefono: telefono,
  };
  console.log(data);
  // Configuración de la solicitud
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  // Realizar la solicitud
  fetch("/guardar-carrito", options)
    .then((response) => response.json())
    .then((data) => {
      // Manejar la respuesta
      console.log(data);
    })
    .catch((error) => {
      // Manejar el error
      console.error(error);
    });

  limpiarCarrito();
  window.location.href = "http://localhost:3000/tbnk/transbank?amount="+subtotal;
};

function enviarTransbankUser(){
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  var subtotal = carrito.reduce(function (total, producto) {
    return total + producto.precioTotal;
  }, 0);
  console.log(carrito);
  const productos = carrito.map(function (producto) {
    return {
      referencia: producto.referencia,
      nombreProducto: producto.nombre,
      precioProducto: producto.precio,
      cantidad: producto.cantidad,
    };
  });

  const descuento =
    productos.reduce(function (total, producto) {
      return total + producto.cantidad;
    }, 0) > 4
      ? 0.2
      : 0;

  const totalConDescuento = subtotal - subtotal * descuento;
  window.location.href = "http://localhost:3000/tbnk/transbank?amount="+totalConDescuento;
}

function enviarTransbank(){
  var carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  var subtotal = carrito.reduce(function (total, producto) {
    return total + producto.precioTotal;
  }, 0);

  window.location.href = "http://localhost:3000/tbnk/transbank?amount="+subtotal;
}

document.addEventListener("DOMContentLoaded", function () {
  // Verifica si la página actual corresponde a la ruta "checkout"
  if (window.location.pathname === "/checkout-user") {
    // Llama a la función para llenar los div en la página de checkout
    llenarOrderSummary();
  } else if (window.location.pathname === "/checkout-invite") {
    llenarOrderSummaryInvitado();
  }
});
// Llama a la función para calcular el subtotal y actualizar el carrito cuando se cargue la página
window.addEventListener("load", function () {
  calcularSubtotal();
  actualizarCarritoView();
  llenarOrderSummary();
});

