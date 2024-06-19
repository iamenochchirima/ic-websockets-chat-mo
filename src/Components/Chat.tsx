import { MutableRefObject, useEffect, useRef, useState } from "react";
import { AppMessage, GroupChatMessage } from "../utils/types";
import { useAuth } from "./Context";
import { InfinitySpin } from "react-loader-spinner";

const Chat = () => {
  const { ws } = useAuth();
  const [wsIsConnecting, setWsIsConnecting] = useState(true);
  const [wsIsConnected, setWsIsConnected] = useState(false);

  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [userVal, setUserVal] = useState("");
  const [userName, setUserName] = useState("");
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [timer, setTimer] = useState(null);

  const handleUsernameChange = () => {
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
    ws.send(msg);
  };

  const handleMessageChange = async (event) => {
    setMessage(event.target.value);
    const msg: GroupChatMessage = {
      name: userName,
      message: event.target.value,
      isTyping: true,
    };
    const appMessage: AppMessage = { GroupMessage: msg };
    sendTypingMessage(appMessage);
  };

  const sendTypingMessage = async (appMessage: AppMessage) => {
    if (!timer) {
      setTimer(
        setTimeout(() => {
          setTimer(null);
        }, 3000)
      );
      ws.send(appMessage);
    }
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
    ws.send(appMessage);
  };

  useEffect(() => {
    if (!ws) {
      return;
    }

    ws.onopen = () => {
      console.log("Connected to the canister");
      setWsIsConnected(true);
      setWsIsConnecting(false);
    };

    ws.onclose = () => {
      console.log("Disconnected from the canister");
      setWsIsConnected(false);
    };

    ws.onerror = (error) => {
      console.log("Error:", error);
    };

    ws.onmessage = async (event) => {
      try {
        const recievedMessage = event.data;
        if ("GroupMessage" in recievedMessage) {
          if (recievedMessage.GroupMessage.isTyping) {
            handleIsTypingMessage(recievedMessage.GroupMessage);
          } else {
            if (recievedMessage.GroupMessage.name !== userName) {
              setMessages((prev) => [...prev, recievedMessage.GroupMessage]);
            }
          }
        }
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
  }, [ws, userName]);

  const handleIsTypingMessage = (message: GroupChatMessage) => {
    if (message.name !== userName) {
      setIsTyping(true);
      setTypingUser(message.name);
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  function useChatScroll<T>(dep: T): MutableRefObject<HTMLDivElement> {
    const ref = useRef<HTMLDivElement>();
    useEffect(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, [dep]);
    return ref;
  }

  const ref = useChatScroll(messages);

  if (wsIsConnecting) {
    return (
      <div className="flex justify-center min-h-screen">
        {wsIsConnecting && (
          <h3 className="text-center flex items-center text-2xl font-semibold">
            Websocket connecting...{" "}
            {<InfinitySpin width="150" color="#2196F3" />}
          </h3>
        )}
      </div>
    );
  }

  if (!wsIsConnected) {
    return (
      <div className="flex justify-center min-h-screen">
        <h3 className="text-center flex items-center text-2xl font-semibold">
          Websocket not connected
        </h3>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex-grow max-w-[800px] rounded ">
        {!userName ? (
          <div className="p-2 flex flex-col items-center justify-center h-[300px] mx-10 bg-gray-700">
            <form action="" onSubmit={handleUsernameChange} className="">
              <div className="flex gap-10 items-center">
                <input
                  value={userVal}
                  type="text"
                  onChange={(e) => setUserVal(e.target.value)}
                  placeholder="Enter your username..."
                  className="p-2 text-gray-800 border border-gray-400 rounded flex-grow-0"
                />
                <button
                  type="submit"
                  className="px-4 mx-3 py-2 flex-grow-1 w-auto rounded bg-blue-500"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-gray-700">
            {/* Chat interface */}
            <div className="flex w-full min-h-[400px] max-h-[500px] flex-col space-y-4 p-3 overflow-y-auto">
              <div className="p-2 justify-center flex items-center">
                {isTyping && (
                  <div
                    className={`w-fit fit bg-gray-600 px-3 py-1 rounded-md text-white transition-opacity duration-500 ease-in-out z-10 fixed top-4`}
                  >
                    <h3 className="">{typingUser} is typing</h3>
                  </div>
                )}
              </div>
              <div
                ref={ref}
                className="flex flex-col max-h-screen space-y-4 p-3 overflow-y-auto"
              >
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
                            {msg.name === userName ? "You" : `${msg.name}`}{" "}
                            joined chat
                          </h1>
                        ) : (
                          <div className="">
                            <h1
                              className={`${
                                msg.name === userName
                                  ? `text-end`
                                  : `text-start`
                              }`}
                            >
                              {msg.name === userName ? "You" : `${msg.name}`}
                            </h1>
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
            </div>
            {/* Message input */}
            <form onSubmit={sendGroupChatMessage} className="p-2">
              <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
                <div className=" flex items-center gap-3">
                  <textarea
                    value={message}
                    onChange={handleMessageChange}
                    placeholder="Write your message!"
                    className="w-full flex-grow-0 focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-md py-3"
                  />

                  <button
                    type="submit"
                    className="inline-flex flex-grow-1 items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
