import IcWebSocketCdk "mo:ic-websocket-cdk-mo";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";

actor {
  // Paste here the principal of the gateway obtained when running the gateway
  // Production gateway
  // let gateway_principal : Text = "lg3nb-si435-jnrox-6qdrd-i6tuh-73huj-vg32b-l3cqf-kpyf4-7c6zg-nae";

  // Local gateway
  let gateway_principal : Text = "jkhgq-q7bza-ztzvn-swx6g-dgkdp-24g7z-54mt2-2edmj-7j4n7-x7qnj-oqe";

  let connected_clients = Buffer.Buffer<IcWebSocketCdk.ClientPrincipal>(0);

  type GroupChatMessage = {
    name : Text;
    message : Text;
    isTyping : Bool;
  };

  type AppMessage = {
    #GroupMessage : GroupChatMessage;
    #JoinedChat : Text;
  };

  var ws_state = IcWebSocketCdk.IcWebSocketState(gateway_principal);

  /// A custom function to send the message to the client
  public func send_app_message(client_principal : IcWebSocketCdk.ClientPrincipal, msg : AppMessage) : async () {
    switch (msg) {
      case (#JoinedChat(message)) {
        Debug.print("Sending message: " # debug_show (message));

        // here we call the ws_send from the CDK!!
        switch (await IcWebSocketCdk.ws_send(ws_state, client_principal, to_candid (msg))) {
          case (#Err(err)) {
            Debug.print("Could not send message:" # debug_show (#Err(err)));
          };
          case (_) {};
        };
      };
      case (#GroupMessage(message)) {
        switch (await IcWebSocketCdk.ws_send(ws_state, client_principal, to_candid (msg))) {
          case (#Err(err)) {
            Debug.print("Could not send message:" # debug_show (#Err(err)));
          };
          case (_) {};
        };
      };
    };
  };

  func on_open(args : IcWebSocketCdk.OnOpenCallbackArgs) : async () {
    connected_clients.add(args.client_principal);
  };

  /// The custom logic is just a ping-pong message exchange between frontend and canister.
  /// Note that the message from the WebSocket is serialized in CBOR, so we have to deserialize it first

  func on_message(args : IcWebSocketCdk.OnMessageCallbackArgs) : async () {
    let app_msg : ?AppMessage = from_candid (args.message);
    switch (app_msg) {
      case (?msg) {
        switch (msg) {
          // If the message is simply a ping pong
          case (#JoinedChat(message)) {
            let clients_to_send = Buffer.toArray<IcWebSocketCdk.ClientPrincipal>(connected_clients);

            for (client in clients_to_send.vals()) {
              await send_app_message(client, #JoinedChat(message));
            };
          };
          // If the message is a group chat message
          case (#GroupMessage(message)) {
            let clients_to_send = Buffer.toArray<IcWebSocketCdk.ClientPrincipal>(connected_clients);

            for (client in clients_to_send.vals()) {
              await send_app_message(client, #GroupMessage(message));
            };
          };
        };

      };
      case (null) {
        Debug.print("Could not deserialize message");
        return;
      };
    };
  };

  func on_close(args : IcWebSocketCdk.OnCloseCallbackArgs) : async () {
    Debug.print("Client " # debug_show (args.client_principal) # " disconnected");

    /// On close event we remove the client from the list of client
    let index = Buffer.indexOf<IcWebSocketCdk.ClientPrincipal>(args.client_principal, connected_clients, Principal.equal);
    switch (index) {
      case (null) {
        // Do nothing
      };
      case (?index) {
        // remove the client at the given even
        ignore connected_clients.remove(index);
      };
    };
  };

  // Returns an array of the the clients connect to the canister
  public shared query func getAllConnectedClients() : async [IcWebSocketCdk.ClientPrincipal] {
    return Buffer.toArray<IcWebSocketCdk.ClientPrincipal>(connected_clients);
  };

  let handlers = IcWebSocketCdk.WsHandlers(
    ?on_open,
    ?on_message,
    ?on_close,
  );

  let params = IcWebSocketCdk.WsInitParams(
    ws_state,
    handlers,

  );
  var ws = IcWebSocketCdk.IcWebSocket(params);

  system func postupgrade() {
    ws_state := IcWebSocketCdk.IcWebSocketState(gateway_principal);
    ws := IcWebSocketCdk.IcWebSocket(params);
  };

  // // method called by the client SDK when instantiating a new IcWebSocket
  // public shared ({ caller }) func ws_register(args : IcWebSocketCdk.CanisterWsRegisterArguments) : async IcWebSocketCdk.CanisterWsRegisterResult {
  //   await ws.ws_register(caller, args);
  // };

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
