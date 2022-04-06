import { Client, UserFlags } from 'discord.js';
import Functions from '../../util/Funcs';
import fetch from 'node-fetch';
import { DiscordSelfbotUser, DiscordUser } from '../../interfaces/discordTypes';

interface DiscordV1Options {
  funcs: Functions;
}

export default class DiscordV1 {
  client: Client;
  funcs: Functions;
  constructor({ funcs }: DiscordV1Options) {
    this.funcs = funcs;
    this.client = new Client({
      intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_MESSAGE_TYPING',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'DIRECT_MESSAGE_TYPING'
      ]
    });

    this.client.login(process.env.V1_DISCORD_TOKEN);
    this.client.once('ready', () => console.log('DiscordV1 Ready'));
  }
  async getUser(userId: string) {
    let standardUser: DiscordUser | any = await this.funcs.runCache(
      `STEALTH:V1:DISCORD:USER:USERDATA:${userId}`,
      async () => {
        return await (await this.client.users.fetch(userId)).toJSON();
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
    let avatarFormats = {};
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
        bio: selfbottedUser.user.bio
      },
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
