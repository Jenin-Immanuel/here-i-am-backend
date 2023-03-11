import mongoose from "mongoose";
import config from "config";

export async function connectToMongo() {
  try {
    await mongoose.connect(config.get("dbUri"));
    console.log("Connected to the mongoDB database");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
