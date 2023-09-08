import React, { useState } from "react";
import Chat from "./Components/Chat";
import { ws } from "./utils/ws";
import Header from "./Components/Header";
import { InfinitySpin } from "react-loader-spinner";

const App = () => {
  const [connecting, setConnecting] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  ws.onopen = () => {
    console.log("Connected to the canister");
    setIsConnected(true);
    setIsClosed(false);
    setConnecting(false);
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

  return (
    <div className="bg-gray-900 text-gray-300 max-h-full">
      {connecting ? (
        <div className="p-2 flex flex-col items-center justify-center h-screen mx-10">
          <h3 className="text-center flex items-center text-2xl font-semibold">
            Websocket connecting...{" "}
            {<InfinitySpin width="150" color="#2196F3" />}
          </h3>
        </div>
      ) : (
        <>
          {" "}
          <Header {...{ connecting, isClosed, isConnected }} />
          <Chat />
        </>
      )}
    </div>
  );
};

export default App;
