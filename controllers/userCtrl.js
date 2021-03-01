import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "./sendMail.js";
const { CLIENT_URL } = process.env;
const UserCtrl = {
  activateEmail: async (req, res) => {
    try {
      const { activation_Token } = req.body;

      const user = jwt.verify(
        activation_Token,
        process.env.ACTIVATION_TOKEN_SECRET
      ); //we get the matched user

      const { name, email, password } = user;

      //second check for email exist
      const check = await User.findOne({ email });
      if (check)
        return res.status(400).json({ message: "Email already exist" });

      const newUsers = new User({
        name,
        email,
        password,
      });

      await newUsers.save();

      res.json({ message: "Your account has been activated" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  register: async (req, res) => {
    const { CLIENT_URL } = process.env;

    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password)
        return res
          .status(400)
          .json({ message: "Please fill in all the field" });

      if (!validateEmail(email))
        return res.status(400).json({ message: "Invalid Email" });

      const user = await User.findOne({ email: email });
      if (user) return res.status(400).json({ message: "Email already exist" });

      if (password.length < 6)
        return res
          .status(400)
          .json({ message: "Password should be atleast 6 characters" });

      const hashPassword = await bcrypt.hash(password, 12);

      const newUsers = {
        name,
        email,
        password: hashPassword,
      };

      const activation_Token = createActivationToken(newUsers);

      const url = `${CLIENT_URL}/users/activate/${activation_Token}`; //this is the frontend url
      sendEmail(email, url, "homepage");

      res.json({
        message: "Register success! Please check your inbox",
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      //we compare the email with password
      const user = await User.findOne({ email: email });
      if (!user) return res.status(400).json({ message: "Invalid Email" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Password is incorrect" });
      console.log(password);
      const refresh_token = createRefreshToken({ id: user._id });
      await res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        path: "/user/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login success" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getAccessToken: async (req, res) => {
    try {
      const rf_token = req.cookies.refresh_token;
      if (!rf_token) return res.status(400).json({ message: "Please login!" });

      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ message: "Please login" });

        const access_token = createAccessToken({ id: user.id });
        res.json({ access_token });
        console.log(user);
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) res.status(404).json({ message: "Email does not exist" });
      const access_token = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`; // this is the fronted end url
      sendEmail(email, url, "reset password");
      res.json({ message: "Reset-password has been sent to your given email" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { password } = req.body;

      const hashPassword = await bcrypt.hash(password, 12);
      await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          password: hashPassword,
        }
      );

      res.json({ message: "Password successfully reseted" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserInfor: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  getUserAllInfo: async (req, res) => {
    try {
      const user = await User.find().select("-password");
      res.json(user);
      console.log(req.user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  logOut: async (req, res) => {
    try {
      res.clearCookie("refresh_token", {
        path: "/user/refresh_token",
      });
      res.json({ message: "Logged out" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, avatar } = req.body;

      const user = await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          name,
          avatar,
        }
      );
      res.json({ message: "User Updated" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updateRole: async (req, res) => {
    try {
      const { role } = req.body;
      await User.findOneAndUpdate({ _id: req.params.id }, { role });

      res.json({ message: "User role Updated" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const removed = await User.findByIdAndDelete({ _id: req.params.id });

      res.json({ message: "Successfully removed" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

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

export default UserCtrl;
