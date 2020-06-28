// @flow

import fetch from "isomorphic-fetch";
import {DepaginatedFetcher, getPages} from "./mirror";
import {DiscordFetcher} from "./fetcher";
import * as Model from "./models";
import {type Snowflake} from "./models";
import Database from "better-sqlite3";
import {fetchDiscord} from "./mirror";
import {SqliteMirror} from "./sqliteMirror";

const DISCORD_SERVER = "https://discordapp.com/api";
const DISCORD_TOKEN_ENV_NAME = "SOURCECRED_DISCORD_BOT_TOKEN";

function buildDepaginatedFetcher(
  guildId: Snowflake,
  discordFetcher: DiscordFetcher
): DepaginatedFetcher {
  return {
    channels(): Promise<$ReadOnlyArray<Model.Channel>> {
      return discordFetcher.channels(guildId);
    },
    members(): Promise<$ReadOnlyArray<Model.GuildMember>> {
      const getMembers = (after: Snowflake) => {
        return discordFetcher.members(guildId, after);
      };
      return getPages(getMembers, "0");
    },
    messages(channel: Snowflake): Promise<$ReadOnlyArray<Model.Message>> {
      const getMessages = (after: Snowflake) => {
        return discordFetcher.messages(channel, after);
      };
      return getPages(getMessages, "0");
    },
    reactions(
      channel: Snowflake,
      message: Snowflake,
      emoji: Model.Emoji
    ): Promise<$ReadOnlyArray<Model.Reaction>> {
      const getReactions = (after: Snowflake) => {
        return discordFetcher.reactions(channel, message, emoji, after);
      };
      return getPages(getReactions, "0");
    },
  };
}

function getTokenFromEnv(): string {
  const token = process.env[DISCORD_TOKEN_ENV_NAME];
  if (token == null) {
    throw new Error(
      `No Discord token provided: please set ${DISCORD_TOKEN_ENV_NAME}`
    );
  }
  return token;
}

export function buildDiscordFetch(fetch: typeof fetch) {
  return async (endpoint: string) => {
    const fetchOptions = {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bot ${getTokenFromEnv()}`,
      },
    };
    const url = new URL(`${DISCORD_SERVER}${endpoint}`).href;
    const resp = await fetch(url, fetchOptions);
    // TODO: Error handling
    return await resp.json();
  };
}

export async function fetchDiscordServer(guildId: Snowflake) {
  const db = new Database(`discord_${guildId}`);
  const sqliteMirror = new SqliteMirror(db, guildId);
  const discordFetch = buildDiscordFetch(fetch);
  const fetchOptions = {
    membersLimit: 100,
    messagesLimit: 100,
    reactionsLimit: 100,
  };
  const fetcher = new DiscordFetcher(discordFetch, fetchOptions);
  const depaginatedFetcher = buildDepaginatedFetcher(guildId, fetcher);
  await fetchDiscord(sqliteMirror, depaginatedFetcher);
}
