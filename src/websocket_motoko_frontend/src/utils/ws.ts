import IcWebSocket from "ic-websocket-js";
import {
    canisterId,
    websocket_motoko_backend,
  } from "../../../declarations/websocket_motoko_backend";


const gatewayUrl = "ws://127.0.0.1:8080";
const icUrl = "http://127.0.0.1:4943";

export const ws = new IcWebSocket(gatewayUrl, undefined, {
  canisterActor: websocket_motoko_backend,
  canisterId: canisterId,
  networkUrl: icUrl,
  localTest: true,
  persistKey: false,
});