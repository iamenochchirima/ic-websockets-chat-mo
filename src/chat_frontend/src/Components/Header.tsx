import React from "react";

const Header = ({ isConnected, connecting }) => {
  return (
    <div>
      <h1 className="py-5 text-center text-5xl font-bold">
        Websocket - Motoko
      </h1>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <a href="https://github.com/iamenochchirima/ic-websockets-chat-mo" className="mb-2 text-blue-500 font-semibold">
          Source code
        </a>
      </div>
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
    </div>
  );
};

export default Header;
