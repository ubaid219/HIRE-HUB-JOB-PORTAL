import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";
// import nodemailer from "nodemailer";

// const sendWelcomeEmail = async (email, name, password) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Welcome to Our Service!',
//       text: `Hi ${name},\n\nWelcome to Hire-Hub! Your login credentials are:\n\nEmail: ${email}\nPassword: ${password}\n\nThank you for registering!`,
//     };

//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     throw new ErrorHandler('Error sending welcome email');
//   }
// };

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  // try {
  //    sendWelcomeEmail(email, name, password);
  // } catch (error) {
  //   return next(new ErrorHandler("Failed to send welcome email"));
  // }
  sendToken(user, 201, res, "User Registered!");
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email, password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler(`User with provided email and ${role} not found!`, 404)
    );
  }
  sendToken(user, 201, res, "User Logged In!");
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200) // Use 200 OK instead of 201 Created
    .cookie("token", "", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Set secure flag in production
      sameSite: "Strict", // Optional: Set SameSite attribute for additional security
    })
    .json({
      success: true,
      message: "Logged Out Successfully.",
    });
});

export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user : req.user,
  });
});