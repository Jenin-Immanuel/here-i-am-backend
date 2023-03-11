import { CreateUserInput, UserModel } from "../schema/user.schema";

class UserService {
  async createUser(input: CreateUserInput) {
    return UserModel.create(input);
  }
}

export default UserService;
