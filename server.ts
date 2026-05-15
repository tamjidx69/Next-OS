import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SSLCommerz Configuration ---
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
const IS_SANDBOX = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const SSLCOMMERZ_API_URL = IS_SANDBOX 
  ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

const SSLCOMMERZ_VALIDATION_URL = IS_SANDBOX
  ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", stripeEnabled: !!stripe });
});

// --- Stripe Payment (USD) ---
app.post("/api/payment/stripe/initiate", async (req, res) => {
  const { plan, userId, userEmail } = req.body;

  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured on this server." });
  }

  const priceMap: Record<string, number> = {
    'pro': 4900,   // $49.00
    'elite': 9900, // $99.00
  };

  const amount = priceMap[plan] || 4900;
  const planName = plan === 'elite' ? 'NextOS Elite (Lifetime)' : 'NextOS Pro (Lifetime)';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: 'Professional-grade neural productivity workspace.',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${APP_URL}/api/payment/success?userId=${userId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/?payment=cancel`,
      customer_email: userEmail,
      metadata: {
        userId,
        plan,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Initiate Payment (SSLCommerz - BDT)
app.post("/api/payment/initiate", async (req, res) => {
  const { amount, userId, userName, userEmail } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const tran_id = uuidv4();

  const data = new URLSearchParams({
    store_id: STORE_ID || '',
    store_passwd: STORE_PASSWORD || '',
    total_amount: amount.toString(),
    currency: 'BDT',
    tran_id: tran_id,
    success_url: `${APP_URL}/api/payment/success?userId=${userId}`,
    fail_url: `${APP_URL}/api/payment/fail?userId=${userId}`,
    cancel_url: `${APP_URL}/api/payment/cancel?userId=${userId}`,
    ipn_url: `${APP_URL}/api/payment/ipn`,
    cus_name: userName || 'Customer',
    cus_email: userEmail || 'customer@example.com',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    shipping_method: 'NO',
    product_name: 'NextOS Pro Subscription',
    product_category: 'Software',
    product_profile: 'non-physical-goods',
  });

  try {
    const response = await axios.post(SSLCOMMERZ_API_URL, data);
    if (response.data?.status === 'SUCCESS') {
      res.json({ url: response.data.GatewayPageURL });
    } else {
      console.error('SSLCommerz Init Error:', response.data);
      res.status(500).json({ error: "Failed to initiate payment", details: response.data });
    }
  } catch (error) {
    console.error('Payment Initiation Error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Success Callback
const handleSuccess = (req: express.Request, res: express.Response) => {
  const { userId } = req.query;
  const val_id = req.body?.val_id || req.query?.session_id;

  res.redirect(`${APP_URL}/?payment=success&userId=${userId}&val_id=${val_id}`);
};

app.post("/api/payment/success", handleSuccess);
app.get("/api/payment/success", handleSuccess);

// Fail Callback
app.post("/api/payment/fail", (req, res) => {
  res.redirect(`${APP_URL}/?payment=fail`);
});

// Cancel Callback
app.post("/api/payment/cancel", (req, res) => {
  res.redirect(`${APP_URL}/?payment=cancel`);
});

// IPN Callback
app.post("/api/payment/ipn", (req, res) => {
  console.log('IPN Received:', req.body);
  res.send('OK');
});

// --- Vite Middleware ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
