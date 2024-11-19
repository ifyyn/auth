import express from "express";
import dotenv from "dotenv";
import dbConnected from "./config/dbConnected.js";
import User from "./models/user.js";
import bcrypt from "bcrypt";
import session from "express-session";
dotenv.config();

const app = express();
const port = process.env.PORT;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  session({
    secret: "notasecreet",
    resave: false,
    saveUninitialized: false,
  })
);

// middleware
const auth = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.send("home page");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashPassword = bcrypt.hashSync(password, 10);

  const user = new User({
    username,
    password: hashPassword,
  });
  await user.save();
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      req.session.user_id = user._id;
      req.session.username = user.username;
      res.redirect("/admin");
    } else {
      res.redirect("/login");
    }
  } else {
    res.redirect("/login");
  }
});
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/admin", auth, (req, res) => {
  res.render("admin");
});
app.get("/edit", auth, (req, res) => {
  res.send(`halo id ${req.session.username}`);
});
dbConnected();
app.listen(port, () => {
  console.log("server is running on port", port);
});
