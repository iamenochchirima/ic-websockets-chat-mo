import { IDL } from "@dfinity/candid";
import { AppMessage } from "./types";

const PingPongMessage = IDL.Record({ message: IDL.Text });
const Typing = IDL.Record({ name: IDL.Text });
const ChatMessage = IDL.Record({ name: IDL.Text, message: IDL.Text });
const GroupChatMessage = IDL.Variant({
  UserTyping: Typing,
  Message: ChatMessage,
});
const AppMessageIdl = IDL.Variant({
  PingPong: PingPongMessage,
  GroupMessage: GroupChatMessage,
});

export const serializeAppMessage = (message: AppMessage): Uint8Array => {
  return new Uint8Array(IDL.encode([AppMessageIdl], [message]));
};

export const deserializeAppMessage = (
  bytes: Buffer | ArrayBuffer | Uint8Array
): AppMessage => {
  return IDL.decode([AppMessageIdl], bytes)[0] as unknown as AppMessage;
};
