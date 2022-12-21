const { Schema, model } = require("mongoose");

const userScheme = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  orders: { type: Array, default: [] },
});

const tourSchema = new Schema({
  tittle: { type: String, required: true },
  price: { type: Number, required: true },
  departureCity: { type: String, required: true },
  arrivalCity: { type: String, required: true },
});

const orderSchema = new Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
});

const hotelSchema = new Schema({
  tittle: { type: String, required: true }
})

const Tour = model("Tour", tourSchema);
const User = model("User", userScheme);
const Order = model("Order", orderSchema);
const Hotel = model("Hotel", hotelSchema);

module.exports = { Tour, User, Order, Hotel };
