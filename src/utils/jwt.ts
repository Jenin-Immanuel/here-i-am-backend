import config from "config";
import jwt from "jsonwebtoken";

const publicKey = Buffer.from(
  config.get<string>("publicKey"),
  "base64"
).toString("ascii");

const privateKey = Buffer.from(
  config.get<string>("privateKey"),
  "base64"
).toString("ascii");

// console.log(publicKey);
// console.log(privateKey);

export function signJWT(object: Object, options?: jwt.SignOptions | undefined) {
  return jwt.sign(object, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJWT<T>(token: string): T | null {
  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (e) {
    return null;
  }
}
