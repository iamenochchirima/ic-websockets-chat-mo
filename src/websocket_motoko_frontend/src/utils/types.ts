export interface ChatMessage {
  name: string;
  message: string;
}

export interface Typing {
  name: string;
}

export type GroupChatMessage =
  | { UserTyping: Typing }
  | { Message: ChatMessage };
export interface PingPongMessage {
  message: string;
}

export type AppMessage =
  | { PingPong: PingPongMessage }
  | { GroupMessage: GroupChatMessage };
