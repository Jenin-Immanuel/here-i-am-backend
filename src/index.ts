import dotenv from "dotenv";
import { createServer } from "http";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();
import { startStandaloneServer } from "@apollo/server/standalone";

import "reflect-metadata";

import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";

import { resolvers } from "./resolvers";
import { connectToMongo } from "./utils/mongo";
import authChecker from "./utils/authChecker";
import Context from "./types/context";
import { verifyJWT } from "./utils/jwt";
import { User } from "./schema/user.schema";
import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import cookieParser from "cookie-parser";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

async function buildContext(ctx: Context) {
  const context = ctx;

  if (ctx.req.cookies.accessToken) {
    const user = verifyJWT<User>(ctx.req.cookies.accessToken);
    context.user = user;
  }
  return context;
}

const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers,
    authChecker,
  });

  const app = express();
  app.use(cookieParser());
  const httpServer = createServer(app);

  const server = new ApolloServer<Context>({
    schema,
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageLocalDefault(),
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: "http://127.0.0.1:5173",
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(server, {
      context: buildContext,
    })
  );

  httpServer.listen(4000, () => {
    console.log(`Server listening on http://localhost:4000/graphql`);
  });

  connectToMongo();
};

bootstrap();
