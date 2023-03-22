import mongoose from "mongoose";
import config from "config";

export async function connectToMongo() {
  try {
    mongoose.connection.syncIndexes();
    await mongoose.connect(config.get("dbUri"), {
      autoIndex: true,
    });
    console.log("Connected to the Mongo DB database");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
