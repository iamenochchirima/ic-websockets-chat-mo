import React, { useState } from "react";
import Chat from "./Components/Chat";
import { ws } from "./utils/ws";
import Header from "./Components/Header";

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
      <Header {...{ connecting, isClosed, isConnected }} />
      <Chat />
    </div>
  );
};

export default App;
