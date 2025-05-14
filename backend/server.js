const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
// const multer = require("multer");
const path = require("path");
const cors = require("cors");
// Create an Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/ecommerce_test", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: String,
  email: String,
  address: String,
  items: String,
  total: Number,
  invoicePdf: Buffer,
});                 

const Order = mongoose.model("Order", orderSchema);

// Route to submit order
app.post("/orders", async (req, res) => {
  const { customerName, email, address, items, total } = req.body;

  const doc = new PDFDocument();
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    const pdfData = Buffer.concat(buffers);

    const order = new Order({
      customerName,
      email,
      address,
      items,
      total,
      invoicePdf: pdfData, // Save the PDF in MongoDB
    });

    try {
      await order.save();
      res.status(200).json({ message: "Order submitted!", _id: order._id });
    } catch (error) {
      res.status(500).json({ message: "Error saving order", error });
    }
  });

  // Generate PDF content
  doc.text(`Invoice for Order`);
  doc.text(`Customer: ${customerName}`);
  doc.text(`Email: ${email}`);
  doc.text(`Address: ${address}`);
  doc.text(`Items: ${items}`);
  doc.text(`Total: $${total}`);

  doc.end();
});

// Route to download the invoice PDF
app.get("/invoices/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || !order.invoicePdf) {
      return res.status(404).send("Invoice not found");
    }
    res.contentType("application/pdf");
    res.send(order.invoicePdf); // Send the PDF to the frontend
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoice", error });
  }
});

// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));
