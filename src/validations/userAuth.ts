import { MiddlewareFn } from "type-graphql";
import Context from "../types/context";
import { verifyJWT } from "../utils/jwt";
import { User } from "../schema/user.schema";

export const userAuth: MiddlewareFn<Context> = async ({ context }, next) => {
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    throw new Error("Not Authorized");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verifyJWT(token);
    context.user = payload as User;
  } catch (e) {
    console.log(e);
    throw new Error("Not Authorized");
  }
  return next();
};
