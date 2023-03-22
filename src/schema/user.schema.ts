import {
  getModelForClass,
  index,
  pre,
  prop,
  queryMethod,
} from "@typegoose/typegoose";
import { IsEmail, MinLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import bcrypt from "bcrypt";
import { AsQueryMethod, ReturnModelType } from "@typegoose/typegoose/lib/types";

function findByEmail(
  this: ReturnModelType<typeof User, QueryHelpers>,
  email: User["email"]
) {
  return this.findOne({ email });
}

interface QueryHelpers {
  findByEmail: AsQueryMethod<typeof findByEmail>;
}

// Encrypt using bcrypt
@pre<User>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // Initialize the salt value
  const salt = await bcrypt.genSalt(10);

  const hash = await bcrypt.hashSync(this.password, salt);
  this.password = hash;
})
@queryMethod(findByEmail)
@index({ email: 1 }, { unique: true })
@ObjectType()
export class User {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  @prop({ required: true })
  name: string;

  @Field(() => String)
  @prop({ required: true, unique: true })
  email: string;

  @prop({ required: true })
  password: string;
}

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name: string;

  @IsEmail()
  @Field(() => String)
  email: string;

  @MinLength(6, { message: "Password needs to be more than 6 chars" })
  @Field(() => String)
  password: string;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  password: string;
}

@InputType()
export class LogoutInput {
  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String)
  password: string;
}

export const UserModel = getModelForClass<typeof User, QueryHelpers>(User);
