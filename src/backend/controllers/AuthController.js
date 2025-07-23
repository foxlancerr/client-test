import { v4 as uuid } from "uuid";
import { Response } from "miragejs";
import { formatDate } from "../utils/authUtils.js";
import sign from "jwt-encode";

export const signupHandler = function (schema, request) {
  console.log("Signup request:", request.requestBody);
  const { email, password, ...rest } = JSON.parse(request.requestBody);
  try {
    // Validate inputs
    if (!email || !password) {
      return new Response(
        400,
        {},
        { errors: ["Email and password are required"] }
      );
    }
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const foundUser = schema.users.findBy({ email: normalizedEmail });
    if (foundUser) {
      return new Response(
        422,
        {},
        { errors: ["Sorry! Email Already Exists."] }
      );
    }
    const _id = uuid();
    const newUser = {
      _id,
      email: normalizedEmail,
      password,
      createdAt: formatDate(),
      updatedAt: formatDate(),
      ...rest,
      cart: [],
      wishlist: [],
      addressList: [],
    };
    const createdUser = schema.users.create(newUser);
    console.log("Created user:", createdUser);
    const encodedToken = sign(
      { _id, email: normalizedEmail },
      process.env.REACT_APP_JWT_SECRET || "fallback-secret"
    );
    return new Response(201, {}, { createdUser, encodedToken });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(500, {}, { error: error.message });
  }
};

export const loginHandler = function (schema, request) {
  const { email, password } = JSON.parse(request.requestBody);
  console.log("All users in schema:", schema.users.all().models);
  debugger
  try {
    // Validate inputs
    if (!email || !password) {
      return new Response(
        400,
        {},
        { errors: ["Email and password are required"] }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const foundUser = schema.users.findBy({ email: normalizedEmail });
    if (!foundUser) {
      return new Response(
        404,
        {},
        { errors: ["The email you entered is not Registered. Not Found error"] }
      );
    }
    if (password === foundUser.password) {
      const encodedToken = sign(
        { _id: foundUser._id, email: normalizedEmail },
        process.env.REACT_APP_JWT_SECRET || "fallback-secret"
      );
      foundUser.password = undefined;
      return new Response(200, {}, { foundUser, encodedToken });
    }
    return new Response(
      401,
      {},
      {
        errors: [
          "The credentials you entered are invalid. Unauthorized access error.",
        ],
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return new Response(500, {}, { error: error.message });
  }
};
