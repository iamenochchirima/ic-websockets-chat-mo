import IcWebSocketCdk "mo:ic-websocket-cdk";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Buffer "mo:base/Buffer";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";

actor {
  // Production gateway
  // let gateway_principal : Text = "3656s-3kqlj-dkm5d-oputg-ymybu-4gnuq-7aojd-w2fzw-5lfp2-4zhx3-4ae";

  // Paste here the principal of the gateway obtained when running the gateway
  // Local gateway
  let gateway_principal : Text = "4vckx-bhbmz-uu3yz-ll4ug-alzch-fifj3-r4ufc-g4nfn-7fz5s-xwo2m-pqe";

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

  func on_message(args : IcWebSocketCdk.OnMessageCallbackArgs) : async () {
    let app_msg : ?AppMessage = from_candid (args.message);
    switch (app_msg) {
      case (?msg) {
        switch (msg) {
          case (#JoinedChat(message)) {
            let clients_to_send = Buffer.toArray<IcWebSocketCdk.ClientPrincipal>(connected_clients);

            for (client in clients_to_send.vals()) {
              await send_app_message(client, #JoinedChat(message));
            };
          };
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
    handlers,
    null,
    null,
    null,
  );
  var ws = IcWebSocketCdk.IcWebSocket(ws_state, params);

  system func postupgrade() {
    ws_state := IcWebSocketCdk.IcWebSocketState(gateway_principal);
    ws := IcWebSocketCdk.IcWebSocket(ws_state, params);
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
  public shared ({ caller }) func ws_message(args : IcWebSocketCdk.CanisterWsMessageArguments, msg_type: ?AppMessage) : async IcWebSocketCdk.CanisterWsMessageResult {
    await ws.ws_message(caller, args, msg_type);
  };

  // method called by the WS Gateway to get messages for all the clients it serves
  public shared query ({ caller }) func ws_get_messages(args : IcWebSocketCdk.CanisterWsGetMessagesArguments) : async IcWebSocketCdk.CanisterWsGetMessagesResult {
    ws.ws_get_messages(caller, args);
  };

};
