import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";

import {
  CreateUserInput,
  LoginInput,
  LogoutInput,
  User,
} from "../schema/user.schema";
import UserService from "../service/user.service";
import Context from "../types/context";
import { userAuth } from "../validations/userAuth";

@Resolver()
export default class UserResolver {
  constructor(private userService: UserService) {
    this.userService = new UserService();
  }

  @Mutation(() => User)
  createUser(@Arg("input") input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  @Mutation(() => String) // Returns the JWT
  loginUser(@Arg("input") input: LoginInput, @Ctx() contextValue: Context) {
    return this.userService.login(input, contextValue);
  }

  @Mutation(() => String)
  @UseMiddleware(userAuth)
  logoutUser(@Arg("input") input: LogoutInput, @Ctx() context: Context) {
    return this.userService.logout(input, context);
  }

  @Query(() => User)
  @UseMiddleware(userAuth)
  me(@Ctx() context: Context) {
    return context.user;
  }
}
