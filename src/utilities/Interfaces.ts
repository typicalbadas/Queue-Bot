export interface ParsedArguments {
   command: string;
   arguments: string;
}

export interface QueueChannel {
   id: number;
   guild_id: string;
   max_members: string;
   queue_channel_id: string;
   target_channel_id: string;
   auto_fill: number; // 0 off. 1 on.
   pull_num: number;
}

export interface DisplayChannel {
   id: number;
   display_channel_id: string;
   embed_ids: string[];
   queue_channel_id: string;
}

export interface QueueGuild {
   id: number;
   color: string;
   cleanup_commands: string;
   grace_period: string;
   guild_id: string;
   msg_mode: number;
   prefix: string;
}

export interface QueueMember {
   id: number;
   created_at: string; // timestamp
   personal_message: string;
   queue_channel_id: string;
   queue_member_id: string;
}

export interface ConfigJson {
   token: string;
   topGgToken: string;

   color: string;
   databaseType: string;
   databaseHost: string;
   databaseName: string;
   databaseUsername: string;
   databasePassword: string;
   gracePeriod: string;
   permissionsRegexp: string;
   prefix: string;
   joinEmoji: string;
}

export interface CommandConfigJson {
   autofillCmd: string;
   cleanupCmd: string;
   clearCmd: string;
   colorCmd: string;
   displayCmd: string;
   gracePeriodCmd: string;
   helpCmd: string;
   joinCmd: string;
   kickCmd: string;
   limitCmd: string;
   modeCmd: string;
   nextCmd: string;
   prefixCmd: string;
   pullNumCmd: string;
   queueCmd: string;
   shuffleCmd: string;
   startCmd: string;
}
