import IcWebSocketCdk "mo:ic-websocket-cdk";
import Text "mo:base/Text";
import Debug "mo:base/Debug";

actor {
  // Paste here the principal of the gateway obtained when running the gateway
  let gateway_principal : Text = "iooeh-5tqqn-c3ego-oav3s-lvcwe-xuybn-e26kv-cblbg-a2axl-lor3f-fae";

  type AppMessage = {
    message : Text;
  };

  var ws_state = IcWebSocketCdk.IcWebSocketState(gateway_principal);

  /// A custom function to send the message to the client
  func send_app_message(client_key : IcWebSocketCdk.ClientPublicKey, msg : AppMessage): async () {
    Debug.print("Sending message: " # debug_show (msg));

    // here we call the ws_send from the CDK!!
    switch (await IcWebSocketCdk.ws_send(ws_state, client_key, to_candid(msg))) {
      case (#Err(err)) {
        Debug.print("Could not send message:" # debug_show (#Err(err)));
      };
      case (_) {};
    };
  };

  func on_open(args : IcWebSocketCdk.OnOpenCallbackArgs) : async () {
    let message : AppMessage = {
      message = "Ping";
    };
    await send_app_message(args.client_key, message);
  };

  /// The custom logic is just a ping-pong message exchange between frontend and canister.
  /// Note that the message from the WebSocket is serialized in CBOR, so we have to deserialize it first

  func on_message(args : IcWebSocketCdk.OnMessageCallbackArgs) : async () {
    let app_msg : ?AppMessage = from_candid(args.message);
    let new_msg: AppMessage = switch (app_msg) {
      case (?msg) { 
        { message = Text.concat(msg.message, " ping") };
      };
      case (null) {
        Debug.print("Could not deserialize message");
        return;
      };
    };

    Debug.print("Received message: " # debug_show (new_msg));

    await send_app_message(args.client_key, new_msg);
  };

  func on_close(args : IcWebSocketCdk.OnCloseCallbackArgs) : async () {
    Debug.print("Client " # debug_show (args.client_key) # " disconnected");
  };

  let handlers = IcWebSocketCdk.WsHandlers(
    ?on_open,
    ?on_message,
    ?on_close,
  );

  var ws = IcWebSocketCdk.IcWebSocket(handlers, ws_state);

  system func postupgrade() {
    ws_state := IcWebSocketCdk.IcWebSocketState(gateway_principal);
    ws := IcWebSocketCdk.IcWebSocket(handlers, ws_state);
  };

  // method called by the client SDK when instantiating a new IcWebSocket
  public shared ({ caller }) func ws_register(args : IcWebSocketCdk.CanisterWsRegisterArguments) : async IcWebSocketCdk.CanisterWsRegisterResult {
    await ws.ws_register(caller, args);
  };

  // method called by the WS Gateway after receiving FirstMessage from the client
  public shared ({ caller }) func ws_open(args : IcWebSocketCdk.CanisterWsOpenArguments) : async IcWebSocketCdk.CanisterWsOpenResult {
    await ws.ws_open(caller, args);
  };

  // method called by the Ws Gateway when closing the IcWebSocket connection
  public shared ({ caller }) func ws_close(args : IcWebSocketCdk.CanisterWsCloseArguments) : async IcWebSocketCdk.CanisterWsCloseResult {
    await ws.ws_close(caller, args);
  };

  // method called by the frontend SDK to send a message to the canister
  public shared ({ caller }) func ws_message(args : IcWebSocketCdk.CanisterWsMessageArguments) : async IcWebSocketCdk.CanisterWsMessageResult {
    await ws.ws_message(caller, args);
  };

  // method called by the WS Gateway to get messages for all the clients it serves
  public shared query ({ caller }) func ws_get_messages(args : IcWebSocketCdk.CanisterWsGetMessagesArguments) : async IcWebSocketCdk.CanisterWsGetMessagesResult {
    ws.ws_get_messages(caller, args);
  };

};
