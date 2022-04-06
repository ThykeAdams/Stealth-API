export interface DiscordUser {
  id: string;
  bot: boolean;
  system: boolean;
  flags: number;
  username: string;
  discriminator: string;
  avatar: string;
  banner: string;
  accentColor: number;
  createdTimestamp: number;
  defaultAvatarURL: string;
  hexAccentColor: string;
  tag: string;
  avatarURL: string;
  displayAvatarURL: string;
  bannerURL?: string;
}
export interface DiscordSelfbotUser {
  user: {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string;
    banner_color: string;
    accent_color: string;
    bio: string;
  };
  connected_accounts: Array<{
    type: string;
    id: string;
    name: string;
    verified: boolean;
  }>;
  premium_since: Date;
  premium_guild_since: Date;
  mutual_guilds: Array<{
    id: string;
    nick: string;
  }>;
}

export interface DiscordMember {}
