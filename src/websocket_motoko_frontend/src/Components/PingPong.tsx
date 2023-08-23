import React from "react";
import {
  canisterId,
  websocket_motoko_backend,
} from "../../declarations/websocket_motoko_backend";
import IcWebSocket from "ic-websocket-js";

const PingPong = () => {
  const gatewayUrl = "ws://127.0.0.1:8080";
  const icUrl = "http://127.0.0.1:4943";

  const ws = new IcWebSocket(gatewayUrl, undefined, {
    canisterActor: websocket_motoko_backend,
    canisterId: canisterId,
    networkUrl: icUrl,
    localTest: true,
    persistKey: false,
  });
  return (
    <div className="min-h-screen max-w-[700px] mt-5 rounded bg-gray-700">
      <div className="w-full h-full flex justify-center ">
        <button className="mt-10 bg-blue-500 rounded-lg py-1.5 px-2 font-semibold hover:bg-gray-900">
          Send Ping
        </button>
      </div>
      <div className=""></div>
    </div>
  );
};

export default PingPong;
