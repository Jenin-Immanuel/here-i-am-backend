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
import { signJWT } from "../utils/jwt";

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
    const t = await UserModel.find().findByEmail(input.email).lean();
    if (t) {
      throw new Error("Email address is already in use");
    }
    try {
      const user = new UserModel(input);
      await user.save();
      return user.toObject();
    } catch (error: any) {
      console.log(error);
      throw new GraphQLError("Email address is already in use");
    }
  }

  async login(input: LoginInput, context: Context) {
    const e = "Invalid email or password";

    // Get our user by email
    const user = await UserModel.find().findByEmail(input.email).lean();

    if (!user) {
      console.log("Error");
      throw new GraphQLError(e);
    }

    // validate the password
    const passwordIsValid = await this.checkPasswordValid(
      input.password,
      user.password
    );

    if (!passwordIsValid) {
      console.log("Error");
      throw new GraphQLError(e);
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
    return "LoggedOut";
  }
}

export default UserService;
