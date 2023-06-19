const express = require("express")
const router = express.Router()
const WebpayPlus = require("transbank-sdk").WebpayPlus; // CommonJS
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require("transbank-sdk");
const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
const connection = require("../database/db");

router.get("/transbank", async(req, res) => {
    const amount = req.query.amount
    const response = await tx.create("pruebajuanma1111", "prueba_1", parseInt(amount), "http://localhost:3000/tbnk/commit_pago");
    return res.render("transbank", {data: response})
})

router.get('/commit_pago', async (req, res) => {
    const token = req.query.token_ws
    await tx.commit(token);
    return res.redirect(`/tbnk/pago_info?token_ws=${token}`)
})

router.get("/pago_info", async (req, res) => {
    const token = req.query.token_ws;
    const response = await tx.status(token);
    
    if (response.status != "AUTHORIZED") {
        // SweetAlert para un pago fallido
        const swalScript = `
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    Swal.fire({
                        icon: 'error',
                        title: '¡PAGO FALLIDO!',
                        text: 'El pago no ha sido autorizado.',
                        confirmButtonText: 'Aceptar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/';
                        }
                    });
                });
            </script>
        `;
        return res.send(swalScript);
    }
    
    // SweetAlert para un pago autorizado
    const swalScript = `
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                Swal.fire({
                    icon: 'success',
                    title: '¡PAGO AUTORIZADO!',
                    text: 'El pago ha sido autorizado.',
                    confirmButtonText: 'Aceptar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/';
                    }
                });
            });
        </script>
    `;
    return res.send(swalScript);
});
router.use("/resources", express.static("public"));
router.use("/resources", express.static(__dirname + "/public"));
module.exports = router;