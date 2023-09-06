import React, { useEffect, useState } from "react";
import { ws } from "../utils/ws";
import { deserializeAppMessage, serializeAppMessage } from "../utils/idl";
import { AppMessage, GroupChatMessage } from "../utils/types";

const Chat = ({ isConnected, connecting }) => {
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [userVal, setUserVal] = useState("");
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleUsernameChange = (event) => {
    setUserName(userVal);
    const handleScrollToBottom = () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    };
    handleScrollToBottom();
  };

  useEffect(() => {
    if (userName) {
      sendJoinedChatMessage();
    }
  }, [userName]);

  const sendJoinedChatMessage = async () => {
    const msg: AppMessage = {
      JoinedChat: userName,
    };
    await ws.send(serializeAppMessage(msg));
  };

  const handleMessageChange = async (event) => {
    setMessage(event.target.value);
    console.log("Message: ", event.target.value)
    const msg: GroupChatMessage = {
      name: userName,
      message: event.target.value,
      isTyping: true,
    }
    const appMessage: AppMessage = { GroupMessage: msg };
    await ws.send(serializeAppMessage(appMessage));
    console.log("Typing message sent")
  };

  const sendGroupChatMessage = async (event) => {
    event.preventDefault();

    const chat: GroupChatMessage = {
      name: userName,
      message: message,
      isTyping: false,
    };
    const appMessage: AppMessage = { GroupMessage: chat };

    setMessages((prev) => [...prev, chat]);
    setMessage("");
    await ws.send(serializeAppMessage(appMessage));
  };

  useEffect(() => {
    ws.onmessage = async (event) => {
      try {
        const recievedMessage = deserializeAppMessage(event.data);

        // If the message is a GroupMessage, check if it is a typing message
        if ("GroupMessage" in recievedMessage) {
          if (recievedMessage.GroupMessage.isTyping) {
            handleIsTypingMessage(recievedMessage.GroupMessage);
          } else {
            if (recievedMessage.GroupMessage.name !== userName) {
              setMessages((prev) => [...prev, recievedMessage.GroupMessage]);
            }
          }
        }
        // If the message is a JoinedChat message, add it to the messages
        if ("JoinedChat" in recievedMessage) {
          const chat: GroupChatMessage = {
            name: recievedMessage.JoinedChat,
            message: "_joined_the_chat_",
            isTyping: false,
          };
          setMessages((prev) => [...prev, chat]);
        }
      } catch (error) {
        console.log("Error deserializing message", error);
      }
    };
  }, [ws.onmessage, userName]);

  const handleIsTypingMessage = (message: GroupChatMessage) => {
    if (message.name !== userName) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  console.log("Typing: ", isTyping)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="min-h-[400px] min-w-[800px] mt-5 rounded bg-gray-700">
        {!userName ? (
          <div className="p-2 mt-[50px] mx-10">
            <form action="" onSubmit={handleUsernameChange} className="">
              <div className="flex gap-10 items-center">
                <input
                  value={userVal}
                  type="text"
                  onChange={(e) => setUserVal(e.target.value)}
                  placeholder="Enter your username..."
                  className="p-2 text-gray-800 border border-gray-400 rounded w-3/4"
                />
                <button
                  type="submit"
                  className="px-4 mx-3 py-2 rounded bg-blue-500"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            {/* Chat interface */}
            <div
              id="messages"
              className="flex w-full min-h-[400px] flex-col space-y-4 p-3 overflow-y-auto"
            >
              {isTyping && (
                <div className="w-full h-full flex gap-5 items-center justify-center my-5">
                  <h3 className="text-lg font-semibold">Someone is typing</h3>  
                </div>
              )}
              <div className="w-full h-full flex gap-5 items-center justify-center my-5">
                {isConnected && (
                  <h3 className="text-lg font-semibold">Websocket open</h3>
                )}
                {connecting && (
                  <h3 className="text-lg font-semibold">
                    Websocket connecting
                  </h3>
                )}
              </div>
              {messages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <div
                    className={`${
                      userName === msg.name ? `justify-end` : ``
                    } flex items-end  ${
                      msg.message === "_joined_the_chat_"
                        ? "justify-center"
                        : ""
                    } `}
                  >
                    <div
                      className={`${
                        userName === msg.name ? `items-end` : `items-start`
                      } flex flex-col space-y-2 max-w-xs mx-2 order-2 `}
                    >
                      {msg.message === "_joined_the_chat_" ? (
                        <h1>
                          {msg.name === userName ? "You" : `${msg.name}`} joined
                          chat
                        </h1>
                      ) : (
                        <div>
                          <h1>{msg.name}</h1>
                          <span
                            className={`${
                              userName === msg.name
                                ? `bg-blue-600 text-white`
                                : ` bg-gray-300 text-gray-600`
                            } backdrop:px-4 px-2 py-2 rounded-lg inline-block rounded-bl-none`}
                          >
                            {msg.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Message input */}
            <form onSubmit={sendGroupChatMessage} className="p-2">
              <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
                <div className="relative flex">
                  <input
                    type="text"
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Write your message!"
                    className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
                  />
                  <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
                    >
                      <span className="font-bold">Send</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-6 w-6 ml-2 transform rotate-90"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
