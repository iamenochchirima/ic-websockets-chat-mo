import IcWebSocket from "ic-websocket-js";
import {
    createActor,
  } from "../../../declarations/chat_backend";

// Production
// const gatewayUrl = "wss://gateway.icws.io";
// const icUrl = "https://icp0.io";
// const canisterId = "a4xo7-maaaa-aaaal-qccga-cai";

// Local test
const gatewayUrl = "ws://127.0.0.1:8080";
const icUrl = "http://127.0.0.1:4943";
const canisterId = "bkyz2-fmaaa-aaaaa-qaaaq-cai";

const websocketBackendActor = createActor(canisterId, {
  agentOptions: {
    host: icUrl,
  }
});

export const ws = new IcWebSocket(gatewayUrl, undefined, {
  canisterActor: websocketBackendActor,
  canisterId: canisterId,
  networkUrl: icUrl,
  localTest: true,
  persistKey: false,
});