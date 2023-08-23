import React from "react";
// import {
//   canisterId,
//   websocket_motoko_backend,
// } from "../../declarations/websocket_motoko_backend";
import IcWebSocket from "ic-websocket-js";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";

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

  // ws.onopen = () => {
  //   console.log("Connected to the canister");
  // };
  
  // ws.onmessage = async (event) => {
  //   console.log("Received message:", event.data);
  
  //   await ws.send({
  //     text: event.data.text + "-pong",
  //   });
  // };
  
  // ws.onclose = () => {
  //   console.log("Disconnected from the canister");
  // };
  
  // ws.onerror = (error) => {
  //   console.log("Error:", error);
  // };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="min-h-screen min-w-[800px] mt-5 rounded bg-gray-700">
        <div className="w-full h-full flex justify-center ">
          <button className="mt-10 bg-blue-500 rounded-lg py-1.5 px-2 font-semibold hover:bg-gray-900">
            Send Ping
          </button>
        </div>
        <div className="mt-5">
          <div className="bg-gray-200 mx-5 p-2 flex gap-10 text-gray-950">
            <span className="flex gap-3 items-center"><BsArrowUp/>  <h1>Frontend</h1></span>
            <h1>Ping</h1>
          </div>
          <div className="bg-gray-900 mx-5  p-2 flex gap-10 text-gray-200">
            <span className="flex gap-3 items-center"><BsArrowDown/>  <h1>Backend</h1></span>
            <h1>Pong</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PingPong;
