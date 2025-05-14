import React, { useState } from "react";
import axios from "axios";

const OrderForm = () => {
  // State variables for order form
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [items, setItems] = useState("");
  const [total, setTotal] = useState("");
  const [orderId, setOrderId] = useState(""); // Store order ID for invoice download

  // Handle order submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      customerName,
      email,
      address,
      items,
      total,
    };

    try {
      // Send order data to backend
      const response = await axios.post(
        "http://localhost:5000/orders",
        orderData
      );
      setOrderId(response.data._id); // Store the order ID
      alert("Order submitted!"); // Success message
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Failed to submit order.");
    }
  };

  // Handle PDF download
  const handleDownload = async () => {
    if (!orderId) {
      alert("No order to download.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/invoices/${orderId}`,
        {
          responseType: "blob", // Handle binary PDF response
        }
      );

      // Create a download link for the PDF
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `invoice-${orderId}.pdf`; // Suggested file name
      link.click(); // Trigger download
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice.");
    }
  };

  return (
    <div>
      <h2>Order Form</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Items"
          value={items}
          onChange={(e) => setItems(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Total"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          required
        />
        <button type="submit">Submit Order</button>
      </form>

      {/* Button to download invoice */}
      {orderId && (
        <div>
          <h3>Download Invoice</h3>
          <button onClick={handleDownload}>Download PDF</button>
        </div>
      )}
    </div>
  );
};

export default OrderForm;
