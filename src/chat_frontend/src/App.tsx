import React, { useEffect, useState } from "react";
import Chat from "./Components/Chat";
import Header from "./Components/Header";
import { InfinitySpin } from "react-loader-spinner";
import { useAuth } from "./Components/Context";

const App = () => {
  const { isAuthenticated, login, checkAuth, identity, ws } = useAuth();
  const [connecting, setConnecting] = useState(true);
  const [isClosed, setIsClosed] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isToolong, setIsToolong] = useState(false);

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

 
  // useEffect(() => {
  //   setTimeout(() => {
  //     if (connecting) {
  //       setIsToolong(true);
  //     }
  //   }, 10000);
  // }, [connecting]);

  useEffect(() => {
    checkAuth();
  }, []);

  console.log(connecting)

  return (
    <div className="bg-gray-900 text-gray-300 max-h-full">
      {!isAuthenticated && (
        <div className="p-2 flex flex-col items-center justify-center h-screen mx-10">
          {connecting && (
            <h3 className="text-center flex items-center text-2xl font-semibold">
              Websocket connecting...{" "}
              {<InfinitySpin width="150" color="#2196F3" />}
            </h3>
          )}
          {isConnected && (
            <h3 className="text-center flex items-center text-2xl font-semibold">
              Websocket connected!
            </h3>
          )}
          {isToolong && (
            <p className="text-center text-sm text-gray-400 mt-4">
              The websocket connection is taking longer than expected. Please
              check your internet connection or try again later.
            </p>
          )}
          <div className="mt-5">
            <button
              onClick={login}
              className="p-2 text-white border px-5 py-2 border-gray-400 rounded flex-grow-0"
            >
              Login with Internet Identity
            </button>
          </div>
        </div>
      )}

      {isAuthenticated && isConnected && (
        <>
          <Header {...{ connecting, isClosed, isConnected }} />
          <Chat />
        </>
      )}
    </div>
  );
};

export default App;
