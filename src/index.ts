import dotenv from "dotenv";

dotenv.config();

import "reflect-metadata";

import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

import { startStandaloneServer } from "@apollo/server/standalone";

import { resolvers } from "./resolvers";

import { connectToMongo } from "./utils/mongo";

const bootstrap = async () => {
  // Build the schema
  const schema = await buildSchema({
    resolvers,
  });

  // Create the apollo server
  const server = new ApolloServer({
    schema,
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageLocalDefault(),
    ],
  });
  // Start the stand alone server
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Server listening at: ${url}`);

  // Connect to db
  connectToMongo();
};

bootstrap();
