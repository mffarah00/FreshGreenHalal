// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post("/api/checkout", async (req, res) => {
    const { name, email, address, total } = req.body;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "yourstore@gmail.com",
            pass: "yourpassword"
        }
    });

    const mailOptions = {
        from: "yourstore@gmail.com",
        to: email,
        subject: "Fresh and Green Halal Market Invoice",
        html: `
            <h2>Thanks for your order, ${name}!</h2>
            <p><strong>Shipping Address:</strong> ${address}</p>
            <p><strong>Order Total:</strong> $${total}</p>
            <p>Your order will be shipped shortly. We'll notify you once it's on the way.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send("Email sent");
    } catch (err) {
        console.error("Email error:", err);
        res.status(500).send("Failed to send invoice");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
