import React from "react";
// import {
//   canisterId,
//   websocket_motoko_backend,
// } from "../../declarations/websocket_motoko_backend";
import IcWebSocket from "ic-websocket-js";

const PingPong = () => {
  const gatewayUrl = "ws://127.0.0.1:8080";
  const icUrl = "http://127.0.0.1:4943";

  // const ws = new IcWebSocket(gatewayUrl, undefined, {
  //   // canisterActor: websocket_motoko_backend,
  //   canisterId: canisterId,
  //   networkUrl: icUrl,
  //   localTest: true,
  //   persistKey: false,
  // });
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="min-h-screen min-w-[800px] mt-5 rounded bg-gray-700">
        <div className="w-full h-full flex justify-center ">
          <button className="mt-10 bg-blue-500 rounded-lg py-1.5 px-2 font-semibold hover:bg-gray-900">
            Send Ping
          </button>
        </div>
        <div className="">
          <div className="bg-gray-300 mx-5 mt-4 p-2 rounded flex gap-5 text-gray-950">
            <h1>Ping</h1>
            <h1>Outgoing</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingPong;
