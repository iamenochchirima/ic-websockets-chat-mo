import { IDL } from "@dfinity/candid";
import { AppMessage } from "./types";

const GroupChatMessage = IDL.Record({
  name: IDL.Text,
  message: IDL.Text,
  isTyping: IDL.Bool,
});
const AppMessageIdl = IDL.Variant({
  JoinedChat: IDL.Text,
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
