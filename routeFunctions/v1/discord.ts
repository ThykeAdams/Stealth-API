import { Client, Presence, UserFlags } from 'discord.js';
import Functions from '../../util/Funcs';
import fetch from 'node-fetch';
import {
  DiscordSelfbotUser,
  DiscordUser,
  DiscordMember
} from '../../interfaces/discordTypes';
import { inspect } from 'util';
import SpotifyV1 from './spotify';

interface DiscordV1Options {
  funcs: Functions;
  spotifyV1: SpotifyV1;
}

export default class DiscordV1 {
  client: Client;
  funcs: Functions;
  spotify: SpotifyV1;
  constructor({ funcs, spotifyV1 }: DiscordV1Options) {
    this.funcs = funcs;
    this.spotify = spotifyV1;
    this.client = new Client({
      intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_PRESENCES']
    });

    this.client.login(process.env.V1_DISCORD_TOKEN);
    this.client.once('ready', () => console.log('DiscordV1 Ready'));

    this.client.on('presenceUpdate', (oldPresence, newPresence) => {
      console.log('Cheese');
      console.log(newPresence?.user?.id);
      this.funcs.redis.set(
        `STEALTH:V1:DISCORD:USER:PRESENCEDATA:${newPresence?.user?.id}`,
        ''
      );
      this.funcs.deleteCache(
        `STEALTH:V1:DISCORD:USER:PRESENCEDATA:${newPresence?.user?.id}`
      );
      this.funcs.deleteCache(
        `STEALTH:REQUESTS:DISCORD:V1:${newPresence?.user?.id}`
      );
    });
    this.client.on('guildMemberUpdate', (oldMember, newMember) => {
      this.funcs.deleteCache(`STEALTH:REQUESTS:DISCORD:V1:${newMember?.id}`);
    });
  }
  async getUser(userId: string) {
    let standardUser: DiscordUser | any = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:USER:USERDATA:${userId}`,
      async () => {
        return await (await this.client.users.fetch(userId)).toJSON();
      }
    );
    let userPresence: DiscordMember | any = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:USER:PRESENCEDATA:${userId}`,
      async () => {
        let guildMember = (await (await this.getGuild())?.members.fetch(userId))
          ?.presence;
        return guildMember
          ? {
              status: guildMember?.status || 'offline',
              clients:
                Object.keys(guildMember?.clientStatus || {}).map((c) =>
                  c.toUpperCase()
                ) || [],
              activities: guildMember?.activities || []
            }
          : { error: 'User is not in the Stealth server' };
      }
    );
    const selfbottedUser: DiscordSelfbotUser | any = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:USER:SELFBOT:${userId}`,
      async () => {
        return await fetch(
          `https://discord.com/api/v9/users/${userId}/profile`,
          {
            headers: {
              authorization:
                'ODk4NTMzMjk3NTQ0NjQyNjMw.YWlmXA.gHuaLHY1d7tOCZhKmvASbOMMx1g'
            }
          }
        ).then((r) => r.json());
      }
    );

    let public_flags = new UserFlags(standardUser.flags);
    let public_flags_array: Array<String> = public_flags.toArray();
    if (selfbottedUser.premium_since) public_flags_array.push('NITRO');
    if (selfbottedUser.premium_guild_since)
      public_flags_array.push('NITRO_GUILD');
    let avatarFormats: any = {};
    for (const format of ['webp', 'png', 'jpg', 'gif']) {
      avatarFormats[format] =
        standardUser.displayAvatarURL.split('.').slice(0, -1).join('.') +
        '.' +
        format;
    }

    let userSpotifyData = userPresence.activities.find(
      (a: any) => a.name == 'Spotify'
    );
    const spotify = await this.funcs.runCache(
      `STEALTH:V1:SPOTIFY:USERAPI:${userSpotifyData.syncId}`,
      async () => {
        let songData: any = await this.spotify.getTrack(
          userSpotifyData?.syncId
        );
        let d = userSpotifyData
          ? {
              trackId: userSpotifyData.syncId,
              trackName: songData.name,
              coverArt: songData.album.images[0].url,
              explicit: songData.explicit,
              artists: songData.artists.map((artist: any) => ({
                name: artist.name,
                link: artist.external_urls.spotify
              })),
              embeddedPreview: songData.preview_url,
              album: {
                name: songData.album.name,
                type: songData.album.album_type,
                artists: songData.album.artists.map((artist: any) => ({
                  name: artist.name,
                  link: artist.external_urls.spotify
                })),
                url: songData.album.external_urls.spotify,
                release: songData.album.release_date,
                tracks: songData.album.total_tracks
              }
            }
          : userPresence?.error
          ? { error: userPresence.error }
          : null;
        return d;
      }
    );
    return {
      user: {
        id: standardUser.id,
        username: standardUser.username,
        discriminator: standardUser.discriminator,
        tag: standardUser.tag,
        bot: standardUser.bot,
        flags: {
          public: public_flags,
          public_array: public_flags_array
        },
        avatarURL: standardUser.displayAvatarURL,
        bannerURL: standardUser.bannerURL,
        bio: selfbottedUser?.user?.bio || undefined
      },
      spotify,
      presence: userPresence,
      connected_accounts: selfbottedUser.connected_accounts,
      moreDetails: {
        avatarFormats
      }
    };
  }
  async getGuild() {
    return this.client.guilds.cache.get(process.env.GUILD_ID || '');
  }
}
