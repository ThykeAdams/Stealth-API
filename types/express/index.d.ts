declare namespace Express {
  // V1 Classes
  import DiscordV1 from '../../routeFunctions/v1/discord';
  import SpotifyV1 from '../../routeFunctions/v1/spotify';

  // Interfaces
  interface Request {
    funcs: any;
    v1: any;
    db: any;
    // v1: {
    //   discord: any;
    //   spotify: SpotifyV1;
    // };
  }
}
