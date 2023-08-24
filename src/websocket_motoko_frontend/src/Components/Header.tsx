import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div>
      <h1 className="py-10 text-center text-5xl font-bold">
        Websocket - Motoko
      </h1>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <ul>
          <li className="flex gap-5">
            <Link
              className="hover:bg-gray-600 py-1.5 px-5 rounded border text-lg"
              to={"/"}
            >
              Ping Pong
            </Link>
            <Link
              className=" hover:bg-gray-600 py-1.5 px-5 rounded border text-lg"
              to={"/chat"}
            >
              Chat
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
