import React, { useEffect, useState } from "react";
import IcWebSocket from "ic-websocket-js";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import {
  canisterId,
  websocket_motoko_backend,
} from "../../../declarations/websocket_motoko_backend";
import { deserializeAppMessage, serializeAppMessage } from "../utils/idl";

const PingPong = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);
  const [connecting, setConnecting] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  type AppMessage = {
    message: string;
  };

  const gatewayUrl = "ws://127.0.0.1:8080";
  const icUrl = "http://127.0.0.1:4943";

  const ws = new IcWebSocket(gatewayUrl, undefined, {
    canisterActor: websocket_motoko_backend,
    canisterId: canisterId,
    networkUrl: icUrl,
    localTest: true,
    persistKey: false,
  });

  ws.onopen = () => {
    console.log("Connected to the canister");
    setIsConnected(true);
    setIsClosed(false);
    setConnecting(false);
  };

  ws.onmessage = async (event) => {
    try {
      console.log("Received message:", deserializeAppMessage(event.data));
      setMessagesCount(messagesCount + 1);

      const message: AppMessage = {
        message: "pong",
      };
      await ws.send(serializeAppMessage(message));
    } catch (error) {
      console.log(error);
    }
  };

  ws.onclose = () => {
    console.log("Disconnected from the canister");
    setIsClosed(true);
    setIsConnected(false);
    setConnecting(false);
  };

  ws.onerror = (error) => {
    console.log("Error:", error);
  };

  const handleClose = () => {
    ws.close();
  };

  const handleReconnect = () => {
    window.location.reload();
  };

  useEffect(() => {
    console.log(messagesCount);
  }, [messagesCount]);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="min-h-screen min-w-[800px] mt-5 rounded bg-gray-700">
        <div className="w-full h-full flex gap-5 items-center justify-center my-5">
          {isConnected && (
            <h3 className="text-lg font-semibold">Websocket open</h3>
          )}
          {isClosed && (
            <h3 className="text-lg font-semibold">Websocket closed</h3>
          )}
          {connecting && (
            <h3 className="text-lg font-semibold">Websocket connecting</h3>
          )}
          <button
            onClick={isConnected ? handleClose : handleReconnect}
            className={` ${
              connecting ? `hidden` : `block`
            } bg-blue-500 rounded-lg py-1.5 px-2 font-semibold hover:bg-gray-900`}
          >
            {isConnected ? "Close" : "Reconnect"}
          </button>
        </div>
        <div className="mt-5">
          <div className="bg-gray-200 mx-5 p-2 flex gap-10 text-gray-950">
            <span className="flex gap-3 items-center">
              <BsArrowUp /> <h1>Frontend</h1>
            </span>
            <h1>Ping</h1>
          </div>
          <div className="bg-gray-900 mx-5  p-2 flex gap-10 text-gray-200">
            <span className="flex gap-3 items-center">
              <BsArrowDown /> <h1>Backend</h1>
            </span>
            <h1>Pong</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingPong;
