const HttpError = require("../Models/http-error");
const Customer = require("../Models/CustomerModel");
const bcrypt = require("bcrypt");
const moment = require("moment");
const Order = require("../Models/OrderModel");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

// helper to generate ID like C0001
async function generateCustomerID() {
  const latestCustomer = await Customer.find().sort({ _id: -1 }).limit(1).exec();
  let id;
  if (latestCustomer && latestCustomer.length !== 0 && latestCustomer[0].ID) {
    const latestId = parseInt(latestCustomer[0].ID.slice(1), 10);
    id = "C" + String(latestId + 1).padStart(4, "0");
  } else {
    id = "C0001";
  }
  return id;
}

const createCustomer = async (req, res, next) => {
  try {
    const { name, telephone, mail, address, city, password } = req.body;

    if (!mail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // ensure mail is string
    if (typeof mail !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid input types" });
    }

    // check existing
    const existing = await Customer.findOne({ mail: mail.toLowerCase() }).exec();
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const id = await generateCustomerID();

    let imagePath = "uploads/images/No-Image-Placeholder.png";
    if (req.file && req.file.path) imagePath = req.file.path;

    const newCustomer = {
      ID: id,
      name: name || "",
      telephone: telephone || "",
      mail: mail.toLowerCase(),
      address: address || "",
      city: city || "",
      password: hashed,
      image: imagePath,
    };

    const customer = await Customer.create(newCustomer);

    const safe = customer.toObject();
    delete safe.password;

    return res.status(201).json(safe);
  } catch (err) {
    console.error("createCustomer error:", err);
    return res.status(500).json({ message: "Registration failed" });
  }
};

const listCustomer = async (req, res) => {
  try {
    const customer = await Customer.find({}, "-password").exec();
    return res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const listCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id, "-password");
    return res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const UpdateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // whitelist allowed fields
    const allowed = ["name", "telephone", "address", "city", "image"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // If there's a file upload, set image
    if (req.file && req.file.path) updates.image = req.file.path;

    const result = await Customer.findByIdAndUpdate(id, updates, { new: true }).select("-password");

    if (!result) {
      return res.status(404).send({ message: "Customer Not Found !" });
    }

    return res.status(200).send({ message: "Customer Updated Successfully!", customer: result });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const DeleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Customer.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send({ message: "Customer Not Found !" });
    }
    return res.status(200).send({ message: "Customer Deleted Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

const getTopCustomersThisMonth = async (req, res) => {
  try {
    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");

    const topCustomers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() },
        },
      },
      { $unwind: "$CartItems" },
      {
        $lookup: {
          from: "products",
          localField: "CartItems.productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$userId",
          totalAmount: {
            $sum: {
              $multiply: [{ $toInt: "$CartItems.quantity" }, { $toDouble: "$product.price" }],
            },
          },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
    ]);

    const customerIds = topCustomers.map((item) => item._id);
    const populatedCustomers = await Customer.find({ _id: { $in: customerIds } }).select("-password");

    const topCustomersDetails = topCustomers.map((item) => {
      const customerDetail = populatedCustomers.find((customer) => customer._id.toString() === item._id.toString());
      return {
        customer: customerDetail,
        totalAmount: item.totalAmount,
      };
    });

    res.json(topCustomersDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCustomer = createCustomer;
exports.listCustomer = listCustomer;
exports.UpdateCustomer = UpdateCustomer;
exports.listCustomerById = listCustomerById;
exports.DeleteCustomer = DeleteCustomer;
exports.getTopCustomersThisMonth = getTopCustomersThisMonth;
