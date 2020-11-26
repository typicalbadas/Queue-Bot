import { Message, NewsChannel, TextChannel, VoiceChannel } from "discord.js";
import { Base } from "./Base";
import { ParsedArguments, QueueGuild } from "./Interfaces";
import { MessageUtils } from "./MessageUtils";
import { QueueChannelTable } from "./tables/QueueChannelTable";

export class ParsingUtils extends Base {
   /**
    * Fetch tailing number from a string.
    * Ex:  '!n #general 2' returns 2.
    * @param message
    * @param argument
    */
   public static getTailingNumberFromString(message: Message, argument: string): number {
      // Get number of users to pop
      let arg = argument.split(" ").slice(-1).pop();
      if (arg === "") return null;

      let num = +arg;
      if (isNaN(num)) {
         return null;
      } else if (num < 1) {
         MessageUtils.scheduleResponseToMessage(`\`amount\` must be a postive number!`, message);
         return null;
      } else {
         return num;
      }
   }

   /**
    * Extracts a channel from command arguments. Starting with the largest matching substring
    * @param availableChannels
    * @param parsed
    * @param message
    */
   public static extractChannel(
      availableChannels: (VoiceChannel | TextChannel | NewsChannel)[],
      parsed: ParsedArguments,
      message: Message
   ): VoiceChannel | TextChannel | NewsChannel {
      let channel = availableChannels.find((ch) => ch.id === message.mentions.channels.array()[0]?.id);
      if (!channel && parsed.arguments) {
         const splitArgs = parsed.arguments.split(" ");
         for (let i = splitArgs.length; i > 0; i--) {
            if (channel) {
               break;
            }
            const channelNameToCheck = splitArgs.slice(0, i).join(" ");
            channel =
               availableChannels.find((ch) => ch.name === channelNameToCheck) ||
               availableChannels.find(
                  (ch) =>
                     ch.name.localeCompare(channelNameToCheck, undefined, {
                        sensitivity: "accent",
                     }) === 0
               );
         }
      }
      return channel;
   }

   /**
    * Send a message detailing that a channel was not found.
    * @param queueGuild
    * @param parsed
    * @param channels
    * @param message
    * @param includeMention
    * @param type
    */
   public static async reportChannelNotFound(
      queueGuild: QueueGuild,
      parsed: ParsedArguments,
      channels: (VoiceChannel | TextChannel | NewsChannel)[],
      message: Message,
      includeMention: boolean,
      isAQueue: boolean,
      type?: string
   ): Promise<void> {
      /* eslint-disable prettier/prettier */
      const target = isAQueue ? "queue" : "channel";
      let response;
      if (channels.length === 0) {

         response =
            "No " + (type ? `**${type}** ` : "") + `queue ${target}s set.\n` +
            "Set a " + (type ? `${type} ` : "") + `queue first using \`${queueGuild.prefix}${this.config.queueCmd} {${target} name}\`.`;
      } else {
         response = "Invalid " + (type ? `**${type}** ` : "") + `${target} name. Try \`${queueGuild.prefix}${parsed.command} `;
         if (channels.length === 1) {
            // Single channel, recommend the single channel
            response += channels[0].name + (includeMention ? " @{user}" : "") + "`.";
         } else {
            // Multiple channels, list them
            response += "{channel name}" + (includeMention ? " @{user}" : "") + "`.";
            if (isAQueue) {
               response +=
                  "\nAvailable " + (type ? `**${type}** ` : "") + `queues: ${channels.map((channel) => " `" + channel.name + "`")}.`;
            }
         }
      }
      //MessageUtils.scheduleResponseToMessage(response, message);
      const _response = await message.channel.send(response).catch(() => null) as Message;
      if (_response) {
         setTimeout(() => {
            _response.delete().catch(() => null);
         }, 10 * 1000);
      }
   }

   /**
    * Get a channel using user argument
    * @param queueGuild
    * @param parsed
    * @param message
    * @param includeMention? Include mention in error message
    * @param type? Type of channels to fetch ('voice' or 'text')
    */
   public static async fetchChannel(
      queueGuild: QueueGuild,
      parsed: ParsedArguments,
      message: Message,
      includeMention?: boolean,
      type?: string
   ): Promise<VoiceChannel | TextChannel | NewsChannel> {
      const guild = message.guild;
      const storedChannels = await QueueChannelTable.fetchStoredQueueChannels(guild);

      if (storedChannels.length > 0) {
         // Extract channel name from message
         const availableChannels = type ? storedChannels.filter((channel) => channel.type === type) : storedChannels;

         if (availableChannels.length === 1) {
            return availableChannels[0];
         } else {
            const channel = this.extractChannel(availableChannels, parsed, message);
            if (channel) {
               return channel;
            } else {
               this.reportChannelNotFound(queueGuild, parsed, availableChannels, message, includeMention, true, type);
            }
         }
      } else {
         MessageUtils.scheduleResponseToMessage(
            `No queue channels set.` + `\nSet a queue first using \`${queueGuild.prefix}${this.config.queueCmd} {channel name}\`.`,
            message
         );
      }
      return null;
   }
}
