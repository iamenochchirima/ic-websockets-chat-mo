import React from "react";

const Header = () => {
  return (
    <div>
      <h1 className="py-10 text-center text-5xl font-bold">
        Websocket - Motoko
      </h1>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <a href="https://github.com/iamenochchirima/ic-websockets-chat-mo" className="mb-4 text-blue-500 font-semibold">
          Source code
        </a>
      </div>
    </div>
  );
};

export default Header;
