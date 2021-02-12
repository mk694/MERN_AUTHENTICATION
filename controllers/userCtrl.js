import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendMail from "./sendMail.js";

const { CLIENT_URL } = process.env;

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password)
        return res
          .status(400)
          .json({ message: "Please fill in all the field" });

      if (!validateEmail(email))
        return res.status(400).json({ message: "Invalid Email" });

      const user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "Email already exist" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ message: "Password should be atleast 6 characters" });

      const hashPassword = await bcrypt.hash(password, 12);

      const newUser = {
        name,
        email,
        password: hashPassword,
      };

      const activation_Token = createActivationToken(newUser);

      const url = `${CLIENT_URL}/user/activate/${activation_Token}`;
      sendMail(email, url);

      res.json({
        message: "Register success! Please activate your email address.",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15d",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export default userCtrl;
