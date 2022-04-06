import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

// Dependancies
import { Server } from 'socket.io';
import express, { Request } from 'express';
import * as http from 'http';
import Redis from 'ioredis';
import cors from 'cors';
import klaw from 'klaw';
import path from 'path';

// Custom Files
import Logger from './util/Logger';
import DBLoader from './db/db';
import mongoose from 'mongoose';
import SocketHandler from './socket';
import Functions from './util/Funcs';

const logger = new Logger();

// V1
import DiscordV1 from './routeFunctions/v1/discord';
import SpotifyV1 from './routeFunctions/v1/spotify';

// Load Servers

const expressServer = express();
const httpServer = http.createServer(expressServer);
const io = new Server(httpServer);
new SocketHandler(io);

const redis = new Redis(process.env.REDIS || '');

const funcs = new Functions({ redis });

new DBLoader().loadModels().then((db) => {
  // Version One
  const spotifyV1 = new SpotifyV1({ funcs, db });
  const discordV1 = new DiscordV1({ funcs, spotifyV1 });

  logger.ready(`Loaded ${Object.keys(db).length} models`);
  redis.once('connect', async () => {
    logger.ready('Redis Connected');
    await mongoose.connect(process.env.MONGO || '');
    logger.ready(`Connected to MongoDB`);

    // Custom Middleware (Load Request functions)
    expressServer.use((req: Request, res, next) => {
      req.funcs = funcs;
      req.db = db;
      req.v1 = {
        discord: discordV1,
        spotify: spotifyV1
      };
      next();
    });

    // Load folders
    await new Promise((resolve, reject) => {
      klaw(__dirname + '/routes')
        .on('data', async (file) => {
          if (file.stats.isDirectory()) return;
          const pathData = path.parse(file.path);
          const filepath = pathData.dir
            .replace(process.cwd(), '')
            .split('\\')
            .join('/')
            .replace('/routes', '/api');
          const routedFile = await import(file.path);
          logger.debug(
            `Loading route: ${
              filepath + '/' + pathData.name.replace('index', '')
            }`
          );
          expressServer.use(
            filepath + '/' + pathData.name.replace('index', ''),
            routedFile.default
          );
        })
        .on('end', () => resolve(true));
    });
    logger.ready('Routes Loaded');

    // Load custom request Object

    // Start Server
    httpServer.listen(process.env.PORT || 3000, () => {
      logger.ready(`Server Started on port ${process.env.PORT || 3000}`);
    });
  });
});
