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
    console.log(this.swa.getCredentials());
  }
  async refreshToken() {
    return new Promise((resolve, reject) => {
      if (this.expires && this.expires > Date.now()) return resolve(true);
      this.swa
        .refreshAccessToken()
        .then((data) => {
          console.log('Tokens Refreshed');
          this.expires = Date.now() + data.body['expires_in'] * 1000;
          this.swa.setAccessToken(data.body['access_token']);
          console.log(data.body['access_token']);
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  async getTrack(trackId: string) {
    await this.refreshToken();
    return new Promise(async (resolve, reject) => {
      let data = await this.db.song.getOne({ 'data.id': trackId });
      if (!data) {
        let songData = await (await this.swa.getTrack(trackId)).body;
        data = {
          data: songData
        };
        data = await this.db.song.create(data);
      }
      resolve(data);
    });
  }
  async getLyrics(trackId: string) {
    return new Promise((resolve, reject) => {
      let url = `https://spclient.wg.spotify.com/color-lyrics/v2/track/${trackId}`;

      let options = {
        method: 'GET',
        qs: { format: 'json', vocalRemoval: 'false', market: 'from_token' },
        headers: {
          accept: 'application/json',
          'app-platform': 'Win32',
          authorization:
            'Bearer BQAsyZue7uuI7PlS1dB2Dp4DJhhwQnrkc-Vdp42iZCxCUbQTqsNs4aJf8KVZzytjJDyUtQbV8tLru-iKmU1afsfZKD87-vgxq63krE5XiVdql62gv1bOg9snCPt3E26ppgxHUVJT3E7uNxMrXxQfJ6tBbEYNqVOq-1eE9Px0tWWtHtlIuH4PBe3HkePisa_hGZ0sEDVn4egpfP3Sn3YiBpDEiYkSvTvqj6lD6a_iR-5hu8F8wgnAb99OslKtvYAD-MPrylM1v2TL_mnH4kpTfPwz2AZ6bdeLoUlNTLqW0XJQ9P0PgA4OA7dAM4S7mL5vu6eqPlYS4EENEDQR5k_my2wMtw',
          'client-token':
            'AADyDJ0SDMVUllzY5zy9drc/PZB7gmVb8DPQR92yVU3iTCx4ir+TKQD7BeI6mPvFQL5M49iVoHz/RuD69nyVTd6boQpe88gW0YyRBqIsXZD8HflK/OisP2fB9Egp0WddgXeMjqUzt2vJfgfRS2eRgnodkt34sIM4jE08nyAyvLlElFWasbG2vf0LG/n3fA4wfVRWpLpHL5p08qJZ6l9flJNQwmlaj7rBUs61HOWQcaPUJCrTVroGDA=='
        }
      };

      fetch(url, options)
        .then((r) => r.json())
        .then((data) => {
          resolve(data);
        })
        .catch((e) => {
          resolve({ lyrics: { lines: [], lyricType: 'Not Found' } });
          console.error(e);
        });
    });
  }
}
