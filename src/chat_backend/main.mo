import IcWebSocketCdk "mo:ic-websocket-cdk";
import IcWebSocketCdkState "mo:ic-websocket-cdk/State";
import IcWebSocketCdkTypes "mo:ic-websocket-cdk/Types";
import Text "mo:base/Text";
import Debug "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Bool "mo:base/Bool";
import Principal "mo:base/Principal";

actor {
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

  /// A custom function to send the message to the client
  public func send_app_message(client_principal : IcWebSocketCdk.ClientPrincipal, msg : AppMessage) : async () {
    switch (msg) {
      case (#JoinedChat(message)) {
        Debug.print("Sending message: " # debug_show (message));

        // here we call the send from the CDK!!
        switch (await IcWebSocketCdk.send(ws_state, client_principal, to_candid (msg))) {
          case (#Err(err)) {
            Debug.print("Could not send message:" # debug_show (#Err(err)));
          };
          case (_) {};
        };
      };
      case (#GroupMessage(_)) {
        switch (await IcWebSocketCdk.send(ws_state, client_principal, to_candid (msg))) {
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

  let params = IcWebSocketCdkTypes.WsInitParams(null, null);
  let ws_state = IcWebSocketCdkState.IcWebSocketState(params);

  let handlers = IcWebSocketCdkTypes.WsHandlers(
    ?on_open,
    ?on_message,
    ?on_close,
  );

  let ws = IcWebSocketCdk.IcWebSocket(ws_state, params, handlers);

  // method called by the WS Gateway after receiving FirstMessage from the client
  public shared ({ caller }) func ws_open(args : IcWebSocketCdk.CanisterWsOpenArguments) : async IcWebSocketCdk.CanisterWsOpenResult {
    await ws.ws_open(caller, args);
  };

  // method called by the Ws Gateway when closing the IcWebSocket connection
  public shared ({ caller }) func ws_close(args : IcWebSocketCdk.CanisterWsCloseArguments) : async IcWebSocketCdk.CanisterWsCloseResult {
    await ws.ws_close(caller, args);
  };

  // method called by the frontend SDK to send a message to the canister
  public shared ({ caller }) func ws_message(args : IcWebSocketCdk.CanisterWsMessageArguments, msg_type : ?AppMessage) : async IcWebSocketCdk.CanisterWsMessageResult {
    await ws.ws_message(caller, args, msg_type);
  };

  // method called by the WS Gateway to get messages for all the clients it serves
  public shared query ({ caller }) func ws_get_messages(args : IcWebSocketCdk.CanisterWsGetMessagesArguments) : async IcWebSocketCdk.CanisterWsGetMessagesResult {
    ws.ws_get_messages(caller, args);
  };

};