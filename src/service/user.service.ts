import { GraphQLError } from "graphql";
import {
  CreateUserInput,
  LoginInput,
  LogoutInput,
  User,
  UserModel,
} from "../schema/user.schema";
import Context from "../types/context";
import bcrypt from "bcrypt";
import { signJWT, verifyJWT } from "../utils/jwt";

class UserService {
  private async checkPasswordValid(
    input_password: string,
    user_password: string
  ): Promise<boolean> {
    const isPasswordValid = await bcrypt.compare(input_password, user_password);
    return isPasswordValid as boolean;
  }

  async getAllUsers() {
    return UserModel.find();
  }

  async createUser(input: CreateUserInput) {
    try {
      const user = new UserModel(input);
      await user.save();
      return user.toObject();
    } catch (error: any) {
      throw new GraphQLError("Email address is already in use");
    }
  }

  async login(input: LoginInput, context: Context) {
    const e = "Invalid email or password";

    // Get our user by email
    const user = await UserModel.find().findByEmail(input.email).lean();

    if (!user) {
      console.log("Error");
      throw new Error(e);
    }

    // validate the password
    const passwordIsValid = this.checkPasswordValid(
      input.password,
      user.password
    );

    if (!passwordIsValid) {
      console.log("Error");
      throw new Error(e);
    }

    // sign a jwt
    const token = signJWT(user);

    // set a cookie for the jwt
    context.res.cookie("accessToken", token, {
      maxAge: 3.154e10, // 1 year
      httpOnly: true,
      domain: "localhost",
      path: "/",
      sameSite: "strict",
      secure: false,
    });

    // return the jwt
    return token;
  }

  async logout(input: LogoutInput, context: Context) {
    const e = "Invalid credentials";
    const user = await UserModel.find().findByEmail(input.email).lean();

    // Check if the user is available
    if (!user) {
      throw new GraphQLError(e, {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }
    // Verify the password
    const isPasswordValid = this.checkPasswordValid(
      input.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new GraphQLError("Invalid password", {
        extensions: {
          code: "BAD_USER_INPUT",
        },
      });
    }

    // // Verify the token
    // const token = context.req.headers["authorization"];
    // if (!token) {
    //   throw new GraphQLError("Not logged in to log out", {
    //     extensions: {
    //       code: "FORBIDDEN",
    //     },
    //   });
    // }
    // const fromToken = verifyJWT<User>(token);
    // console.log(fromToken);
    // console.log(token);
    // if (fromToken === user) {
    //   return "Loggedout";
    // } else {
    //   throw new GraphQLError("Token has been tampered", {
    //     extensions: {
    //       code: "FORBIDDEN",
    //     },
    //   });
    // }

    return "LoggedOut";
  }
}

export default UserService;
