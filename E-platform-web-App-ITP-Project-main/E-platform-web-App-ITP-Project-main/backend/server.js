// backend/server.js
require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("../passport"); // make sure this exports configured passport

// Import routes
const ProductRoute = require("./Routes/ProductRoute");
const SupplierRoute = require("./Routes/SupplierRoute");
const SupplierProductRoute = require("./Routes/SupplierProductRoute");
const DeliveryRoute = require("./Routes/DeliveryRoute");
const EmployeeRoute = require("./Routes/EmployeeRoute");
const OffPay = require("./Routes/OfflinePaymentRoute");
const OnPay = require("./Routes/OnlinePayRoute");
const AttendanceRoute = require("./Routes/AttendanceRoute");
const CartRoute = require("./Routes/CartRoute");
const CustomerRoute = require("./Routes/CustomerRoute");
const OrderRoute = require("./Routes/OrderRoute");
const LoginRoute = require("./Routes/LoginRoute");
const NotificationRoute = require("./Routes/NotificationRoute");
const WholesalecustomerRoute = require("./Routes/WholesalecustomerRoute");
const SalaryRoute = require("./Routes/SalaryRoute");
const PaymentRoute = require("./Routes/PaymentRoute");
const ProductReviewRoute = require("./Routes/ProductReviewRoute");
const FaqRoute = require("./Routes/FaqRoute");
const InquiryRoute = require("./Routes/InquiryRoute");
const DeliveryLoginRoute = require("./Routes/DeliveryLoginRoute");
const DeliveryPersonLoginRoute = require("./Routes/DeliveryLoginpRoute");
const ProfitRoute = require("./Routes/ProfitRoute");
const AvailableRoute = require("./Routes/AvailableRoute");
const salaryHistoryRoute = require("./Routes/salaryHistoryRoute");
const DeliveryOrderRoute = require("./Routes/AssignRoute");
const EmployeeLoginRoute = require("./Routes/EmployeeLoginRoute");
const EmployeePersonLoginRoute = require("./Routes/EmployeeloginPersonRoute");
const InvoiceRoute = require("./Routes/InvoiceRoute");
const oauthRoutes = require("./Routes/oauth-routes"); // Google OAuth

const app = express();

// ------------------ Security Middlewares ------------------
const frontendOrigin = (process.env.FRONTEND_URL || "http://localhost:3000").trim();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
        connectSrc: ["'self'", frontendOrigin],
        frameAncestors: ["'self'"],
      },
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(mongoSanitize());

// ------------------ Static Files ------------------
app.use(express.static(path.join(__dirname, "public")));


// ------------------ CORS ------------------
app.use(
  cors({
    origin: frontendOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// ------------------ Session Config ------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change_this_in_production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: false, // true if HTTPS
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ------------------ Passport ------------------
app.use(passport.initialize());
app.use(passport.session());

// ------------------ Rate Limiting ------------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: "Too many login attempts. Try again later." },
});
app.use("/login", authLimiter);
app.use("/Login", authLimiter);

// ------------------ Routes ------------------
app.use("/product", ProductRoute);
app.use("/customer", CustomerRoute);
app.use("/supplier", SupplierRoute);
app.use("/employee", EmployeeRoute);
app.use("/supplierproduct", SupplierProductRoute);
app.use("/attendance", AttendanceRoute);
app.use("/delivery", DeliveryRoute);
app.use("/cart", CartRoute);
app.use("/OffPay", OffPay);
app.use("/OnPay", OnPay);
app.use("/Login", LoginRoute);
app.use("/login", LoginRoute);
app.use("/order", OrderRoute);
app.use("/salary", SalaryRoute);
app.use("/notify", NotificationRoute);
app.use("/wholesalecustomer", WholesalecustomerRoute);
app.use("/faq", FaqRoute);
app.use("/inquiry", InquiryRoute);
app.use("/Payment", PaymentRoute);
app.use("/uploads/images", express.static(path.join("uploads", "images")));
app.use("/ProductReview", ProductReviewRoute);
app.use("/deliverylogin", DeliveryLoginRoute);
app.use("/deliveryCheckLogin", DeliveryPersonLoginRoute);
app.use("/profit", ProfitRoute);
app.use("/available", AvailableRoute);
app.use("/salaryHistory", salaryHistoryRoute);
app.use("/EmployeeLogin", EmployeeLoginRoute);
app.use("/deliveryOrder", DeliveryOrderRoute);
app.use("/EmployeeChecklogin", EmployeePersonLoginRoute);
app.use("/Invoice", InvoiceRoute);

// Google OAuth
app.use("/auth", oauthRoutes);



app.get("/product/:id", (req, res) => {
  // Block all scripts with CSP
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'none'");

  // Serve the product page (React or static HTML)
  res.sendFile(path.join(__dirname, "public", "product.html"));
});


// ------------------ Authenticated User Endpoint ------------------
app.get("/me", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user && req.user.toObject ? req.user.toObject() : req.user;
    if (user && user.password) delete user.password;
    return res.json({ user });
  }
  res.status(401).json({ user: null });
});

    // With CSP: script should be blocked
    app.get("/withcsp", (req, res) => {
      // CSP blocks scripts from anywhere other than 'self'
      res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'none'");
      res.send(`
        <html>
          <body>
            <h1>Test Page - With CSP</h1>
            <div id="output"></div>
            <script src="/evil.js"></script>
          </body>
        </html>
      `);
    });

// No CSP: script should run
app.get("/nocsp", (req, res) => {
  res.send(`
    <html>
      <body>
        <h1>Test Page - No CSP</h1>
        <div id="output"></div>
        <script src="/evil.js"></script>
      </body>
    </html>
  `);
});


// ------------------ 404 ------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} 🔥`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
