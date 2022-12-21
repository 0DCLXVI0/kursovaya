const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const model = require("./models");
const jwt = require("jsonwebtoken");
const TOKEN_SECRET = "qwerty";

app.use(bodyParser.json());
app.use(cors());

const generateAccesToken = ({ id, role }) =>
  jwt.sign({ id, role }, TOKEN_SECRET);

app.post("/user/registration/", async (req, res) => {
  try {
    const { email, password } = req.body;
    (await model.User.findOne({ email }))
      ? res
          .status(400)
          .send({ message: "Пользователь с таким email существует" })
      : null;
    const hashPassword = bcrypt.hashSync(password, 7);
    await model.User.create({ email, password: hashPassword });
    res.send({ message: "Пользователь зарегестрирован" });
  } catch (err) {
    console.log(err);
  }
});
app.post("/user/authorization/", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await model.User.findOne({ email });
    user
      ? null
      : res.status(400).send({ message: `Пользователь ${email} не найден` });
    const validPassword = bcrypt.compare(password, user.password);
    validPassword
      ? null
      : res.status(400).send({ message: `Неправильный пароль` });
    const token = generateAccesToken({ id: user._id, role: user.role });
    res.send({ message: "Пользователь авторизован", token });
  } catch (err) {
    console.log(err);
  }
});
app.get("/catalog/", async (req, res) => {
  try {
    const catalog = await model.Tour.find();
    res.send(catalog);
  } catch (err) {
    console.log(err);
  }
});
app.post("/addTour/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    token
      ? null
      : res.status(400).send({ message: "Пользователь неавторизован" });
    const { role } = jwt.verify(token, TOKEN_SECRET);
    role === "admin"
      ? (await model.Tour.create({ ...req.body })) &&
        res.send({ message: "Тур добавлен" })
      : res.status(400).send({ message: "У вас недостаточно прав" });
  } catch (err) {
    console.log(err);
  }
});
app.post("/deleteTour/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    token
      ? null
      : res.status(400).send({ message: "Пользователь неавторизован" });
    const { role } = jwt.verify(token, TOKEN_SECRET);
    role === "admin"
      ? (await model.Tour.deleteOne({ _id: req.body.id })) &&
        res.send({ message: "Тур удалён" })
      : res.status(400).send({ message: "У вас недостаточно прав" });
  } catch (err) {
    console.log(err);
  }
});
app.get("/user/getUser/", async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const { role, id } = jwt.verify(token, TOKEN_SECRET);
      const user = { role, id };
      res.send(user);
    } else res.send(undefined);
  } catch (err) {
    console.log(err);
  }
});
app.post("/basket/", async (req, res) => {
  try {
    const { basketId } = req.body;
    basketId
      ? res.send(
          await Promise.all(
            basketId.map(async (item) => await model.Tour.findById(item._id))
          )
        )
      : res.send([]);
  } catch (err) {
    console.log(err);
  }
});
app.post("/buy/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const { id } = jwt.verify(token, TOKEN_SECRET);
    token
      ? null
      : res.status(400).send({ message: "Пользователь неавторизован" });
    const { basketId } = req.body;
    basketId
      ? (await model.Order.create({userId: id, items: basketId })) && res.send(basketId)
      : res.send([]);
  } catch (err) {
    console.log(err);
  }
});

app.listen(3008, async () => {
  await mongoose.connect("mongodb://localhost:27017/test");
  console.log("Сервер запущен");
});
