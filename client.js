import axios from "axios";
const API = "http://localhost:3000";

(async () => {
  try {
    const health = await axios.get(`${API}/api/health`, { timeout: 5000 });
    console.log("Health:", health.data);

    const res = await axios.post(`${API}/api/create-order`, {
      amount: 500,
      currency: "KZT",
      merchant_order_id: "order-0001",
      description: "Test payment",
      return_url: "https://example.com/pay/success",
      callback_url: "https://api.example.com/api/webhook/paymtech"
    }, { timeout: 15000 });

    console.log("Order:", res.data);
  } catch (err) {
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Body:", err.response.data);
      console.error("Headers:", err.response.headers);
    } else if (err.request) {
      console.error("No response. Code:", err.code);
      try { console.error("Axios:", err.toJSON()); } catch {}
    } else {
      console.error("Setup error:", err.message);
    }
  }
})();
