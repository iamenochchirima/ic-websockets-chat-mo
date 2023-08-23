import IcWebSocket "mo:ic-websocket-cdk-mo";
import Text "mo:base/Text";
import Debug "mo:base/Debug";

actor {

  public type AppMessage = {
    message : Text;
  };

  func on_open(args : IcWebSocketCdk.OnOpenCallbackArgs) : async () {
    let message : AppMessage = {
      message = "Ping";
    };
    send_app_message(args.client_key, message);
  };

  /// The custom logic is just a ping-pong message exchange between frontend and canister.
  /// Note that the message from the WebSocket is serialized in CBOR, so we have to deserialize it first

  public func on_message(args : IcWebSocketCdk.OnMessageCallbackArgs) : async () {
    let app_msg : AppMessage = {
      message = Text.decodeUtf8(args.message);
    };
    let new_msg = AppMessage { text = Text.concat(app_msg.text, " ping") };

    Debug.print(Text.concat("Received message: " # debug_show (new_msg)));

    send_app_message(args.client_key, new_msg);
  };

  func on_close(args : IcWebSocketCdk.OnCloseCallbackArgs) : async () {
    Debug.print("Client " # debug_show (args.client_key) # " disconnected");
  };

  /// A custom function to send the message to the client
  func send_app_message(client_key : IcWebSocketCdk.ClientPublicKey, msg : AppMessage) {
    Debug.print("Sending message: " # debug_show (msg));

    // here we call the ws_send from the CDK!!
    switch (IcWebSocketCdk.ws_send(client_key, msg)) {
      case (#Err(err)) {
        Debug.print("Could not send message:" # debug_show (#Err(err)));
      };
      case (_) {};
    };
  };

  let handlers = IcWebSocketCdk.WsHandlers(
    ?on_open,
    ?on_message,
    ?on_close,
  );

  // Paste here the principal of the gateway obtained when running the gateway
  let GATEWAY_PRINCIPAL : Text = "iooeh-5tqqn-c3ego-oav3s-lvcwe-xuybn-e26kv-cblbg-a2axl-lor3f-fae";

  var ws = IcWebSocketCdk.IcWebSocket(handlers, gateway_principal);

  system func postupgrade() {
    ws := IcWebSocketCdk.IcWebSocket(handlers, gateway_principal);
  };

  // method called by the client SDK when instantiating a new IcWebSocket
  public shared ({ caller }) func ws_register(args : IcWebSocketCdk.CanisterWsRegisterArguments) : async IcWebSocketCdk.CanisterWsRegisterResult {
    ws.ws_register(caller, args);
  };

  // method called by the WS Gateway after receiving FirstMessage from the client
  public shared ({ caller }) func ws_open(args : IcWebSocketCdk.CanisterWsOpenArguments) : async IcWebSocketCdk.CanisterWsOpenResult {
    ws.ws_open(caller, args);
  };

  // method called by the Ws Gateway when closing the IcWebSocket connection
  public shared ({ caller }) func ws_close(args : IcWebSocketCdk.CanisterWsCloseArguments) : async IcWebSocketCdk.CanisterWsCloseResult {
    ws.ws_close(caller, args);
  };

  // method called by the frontend SDK to send a message to the canister
  public shared ({ caller }) func ws_message(args : IcWebSocketCdk.CanisterWsMessageArguments) : async IcWebSocketCdk.CanisterWsMessageResult {
    ws.ws_message(caller, args);
  };

  // method called by the WS Gateway to get messages for all the clients it serves
  public shared query ({ caller }) func ws_get_messages(args : IcWebSocketCdk.CanisterWsGetMessagesArguments) : async IcWebSocketCdk.CanisterWsGetMessagesResult {
    ws.ws_get_messages(caller, args);
  };

};
