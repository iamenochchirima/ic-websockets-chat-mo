export interface GroupChatMessage {
  name: string;
  message: string;
  isTyping: boolean;
}

export type AppMessage =
  | { JoinedChat: string }
  | { GroupMessage: GroupChatMessage };
