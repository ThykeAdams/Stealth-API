import { Client, Presence, UserFlags } from 'discord.js';
import Functions from '../../util/Funcs';
import fetch from 'node-fetch';
import Spotify from 'spotify-web-api-node';
import tokens from '../../tokens.json';

interface SpotifyV1Options {
  funcs: Functions;
  db: any;
}

export default class SpotifyV1 {
  swa: Spotify;
  expires: any;
  funcs: Functions;
  db: any;
  constructor({ funcs, db }: SpotifyV1Options) {
    this.funcs = funcs;
    this.db = db;
    this.swa = new Spotify(tokens.spotify);
    this.expires = null;
  }
  async refreshToken() {
    return new Promise((resolve, reject) => {
      if (this.expires && this.expires > Date.now()) return resolve(true);
      console.log('Refreshing Spotify Token');
      this.swa
        .refreshAccessToken()
        .then((data) => {
          console.log('Tokens Refreshed');
          this.expires = Date.now() + data.body['expires_in'] * 1000;
          this.swa.setAccessToken(data.body['access_token']);
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getTrack(trackId: string) {
    return this.funcs.runCache(
      `STEALTH:V1:SPOTIFY:TRACK:${trackId}`,
      async () => {
        await this.refreshToken();
        return await (
          await this.swa.getTrack(trackId)
        ).body;
      }
    );
  }
}
