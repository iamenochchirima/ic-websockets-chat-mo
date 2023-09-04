import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Components/Layout";
import PingPong from "./Components/PingPong";
import Chat from "./Components/Chat";
import { ws } from "./utils/ws";

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
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={<PingPong {...{ connecting, isClosed, isConnected }} />}
          />
          <Route path="/chat" element={<Chat {...{isConnected, connecting}} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
