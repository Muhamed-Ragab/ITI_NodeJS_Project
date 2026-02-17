import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { findUserByEmail, findUserByGoogleId, createUser } from "./auth.repository.js";
import { ApiError } from "../../utils/errors/api-error.js";

export const registerUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw ApiError.badRequest({ message: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, password: hashed });

  const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined; // اخفاء الباسورد
  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw ApiError.unauthorized({ message: "Invalid credentials" });

  const match = bcrypt.compareSync(password, user.password);
  if (!match) throw ApiError.unauthorized({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined; // اخفاء الباسورد
  return { user, token };
};

export const handleGoogleCallback = async (profile) => {
  let user = await findUserByGoogleId(profile.id);
  if (!user) {
    user = await createUser({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
    });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  user.password = undefined; // اخفاء الباسورد
  return { user, token };
};
