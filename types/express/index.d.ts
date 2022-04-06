declare namespace Express {
  import DiscordV1 from '../../routeFunctions/v1/discord';
  interface V1Options {
    discord: DiscordV1;
  }
  interface Request {
    funcs: any;
    v1: V1Options;
  }
}
