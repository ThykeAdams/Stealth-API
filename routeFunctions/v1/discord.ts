import { Client, UserFlags } from 'discord.js';
import Functions from '../../util/Funcs';
import fetch from 'node-fetch';
import { DiscordSelfbotUser, DiscordUser } from '../../interfaces/discordTypes';
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
      intents: 131071
    });
    this.client.login(process.env.V1_DISCORD_TOKEN);
    this.client.once('ready', async () => {
      await this.client.guilds.cache
        .get(process.env.GUILD_ID || '')
        ?.members.fetch();
      console.log('DiscordV1 Ready');
    });

    this.client.on('presenceUpdate', (oldPresence, newPresence) => {
      this.funcs.redis.set(
        `STEALTH:V1:DISCORD:USER:PRESENCEDATA:${newPresence?.user?.id}`,
        ''
      );
      this.funcs.deleteCache(
        `STEALTH:REQUESTS:DISCORD:V1:${newPresence?.user?.id}`
      );
      this.getUser(newPresence?.user?.id || '').then(async (user) => {
        await this.funcs.emitAll(
          `DISCORD_V1_PRESENCE:${user.user.id}`,
          user
        );
      });
    });
    this.client.on('memberPresenceUpdate', (oldMember, newMember) => {
      this.funcs.deleteCache(`STEALTH:REQUESTS:DISCORD:V1:${newMember?.id}`);
    });
  }
  async getUser(userId: string) {
    let standardUser: DiscordUser | any = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:USER:USERDATA:${userId}`,
      async () => {
        let user = await this.client.users.fetch(userId);
        if (!user.banner)
          user = await this.client.users.fetch(userId, { force: true });
        const jsonUser: any = user.toJSON();
        return {
          ...jsonUser,
          bannerURL: user.bannerURL({ dynamic: true })
        };
      }
    );
    let userPresence: any = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:USER:PRESENCEDATA:${userId}`,
      async () => {
        let guild = await this.client.guilds.cache.get(
          process.env.GUILD_ID || ''
        );
        let guildMember = await guild?.members.cache.get(userId);
        const memberPresence = guildMember?.presence;
        return memberPresence
          ? {
              status: memberPresence?.status || 'offline',
              clients:
                Object.keys(memberPresence?.clientStatus || {}).map((c) =>
                  c.toUpperCase()
                ) || [],
              activities: memberPresence?.activities || []
            }
          : guildMember
          ? {
              status: 'offline',
              clients: [],
              activities: []
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

    let userSpotifyData = userPresence?.activities?.find(
      (a: any) => a.name == 'Spotify'
    );
    const spotify = userSpotifyData
      ? await this.funcs.runCache(
          `STEALTH:V1:SPOTIFY:USERAPI:${userSpotifyData?.syncId}`,
          async () => {
            let songData: any = await this.spotify.getTrack(
              userSpotifyData?.syncId
            );
            let d = userSpotifyData
              ? {
                  trackId: userSpotifyData.syncId,
                  trackName: songData.data.name,
                  coverArt: songData.data.album.images[0].url,
                  explicit: songData.data.explicit,
                  artists: songData.data.artists.map((artist: any) => ({
                    name: artist.name,
                    link: artist.external_urls.spotify
                  })),
                  embeddedPreview: songData.data.preview_url,
                  album: {
                    name: songData.data.album.name,
                    type: songData.data.album.album_type,
                    artists: songData.data.album.artists.map((artist: any) => ({
                      name: artist.name,
                      link: artist.external_urls.spotify
                    })),
                    url: songData.data.album.external_urls.spotify,
                    release: songData.data.album.release_date,
                    tracks: songData.data.album.total_tracks,
                    lyrics: songData.lyrics.lyrics
                      .map((l: any) => l.words)
                      .join('\n')
                  }
                }
              : userPresence?.error
              ? { error: userPresence.error }
              : null;
            return d;
          }
        )
      : null;
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
  async getInvite(code: String) {
    let Data = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:INVITES:${code}`,
      async () => {
        let data = await fetch(
          `https://canary.discord.com/api/v9/invites/${code}?with_counts=true&with_expiration=true`,
          {
            headers: {
              authorization:
                'ODk4NTMzMjk3NTQ0NjQyNjMw.YWlmXA.gHuaLHY1d7tOCZhKmvASbOMMx1g'
            }
          }
        ).then((r) => r.json());
        return {
          code: data.code,
          id: data.guild.id,
          name: data.guild.name,
          description: data.guild.description,
          members: data.approximate_member_count,
          bannerURL: `https://cdn.discordapp.com/banners/${data.guild.id}/${data.guild.banner}.png`,
          iconURL: `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.png`,
          splashURL: `https://cdn.discordapp.com/splashes/${data.guild.id}/${data.guild.splash}.png`,
          boosters: data.guild.premium_subscription_count,
          features: data.guild.features,
          vanity: data.guild.vanity_url_code,
          verification_level: data.guild.verification_level,
          nsfw: data.guild.nsfw,
          channel: {
            id: data.channel.id,
            name: data.channel.name
          }
        };
      }
    );
    return Data;
  }
}
