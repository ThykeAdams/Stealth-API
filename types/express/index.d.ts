declare namespace Express {
  import { Server } from 'socket.io';
  import Functions from '../../util/Funcs';

  // V1 Classes
  import DiscordV1 from '../../routeFunctions/v1/discord';
  import SpotifyV1 from '../../routeFunctions/v1/spotify';

  // Interfaces
  interface Request {
    funcs: Functions;
    v1: any;
    db: any;
    io: Server;
    query: {
      url: string;
      array: array;
      items: any;
    };
    // v1: {

    //   discord: any;
    //   spotify: SpotifyV1;
    // };
  }
}
