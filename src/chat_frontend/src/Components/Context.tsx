import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import React, { FC, createContext, useContext, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  chat_backend,
  idlFactory,
} from "../../../declarations/chat_backend";
import IcWebSocket, { generateRandomIdentity } from "ic-websocket-js";

const authClient = await AuthClient.create();

// const host = "http://localhost:8080";

const host = "https://icp0.io";

interface LayoutProps {
  children: React.ReactNode;
}

type Context = {
  identity: null;
  backendActor: any;
  isAuthenticated: boolean;
  ws: any;
  login: () => void;
  logout: () => void;
  checkAuth: () => void;
};

const initialContext: Context = {
  identity: null,
  backendActor: null,
  isAuthenticated: false,
  ws: null,
  login: (): void => {
    throw new Error("login function must be overridden");
  },
  logout: (): void => {
    throw new Error("logout function must be overridden");
  },
  checkAuth: (): void => {
    throw new Error("checkAuth function must be overridden");
  },
};

const ContextWrapper = createContext<Context>(initialContext);

export const useAuth = () => {
  return useContext(ContextWrapper);
};

const Context: FC<LayoutProps> = ({ children }) => {
  const [identity, setIdentity] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async () => {
    await authClient.login({
      identityProvider: "https://identity.ic0.app/#authorize",
      onSuccess: () => {
        setIsAuthenticated(true);
        checkAuth();
      },
    });
  };

  const checkAuth = async () => {
    try {
      if (await authClient.isAuthenticated()) {
        setIsAuthenticated(true);
        const identity = authClient.getIdentity();
        setIdentity(identity);
      }
    } catch (error) {
      console.log("Error in checkAuth", error);
    }
  };

  const logout = async () => {
    await authClient.logout();
    setIsAuthenticated(false);
    setIdentity(null);
  };

  let agent = new HttpAgent({
    host: host,
    identity: identity,
  });
  // agent.fetchRootKey();

  const backendActor = Actor.createActor(idlFactory, {
    agent,
    canisterId: canisterId,
  });

  ////////////////////// Websockets////////////////////////////////

  // Production
  // const gatewayUrl = "wss://gateway.icws.io";
  // const icUrl = "https://icp0.io";

  // Local test
  const gatewayUrl = "ws://127.0.0.1:8080";
  const icUrl = "http://127.0.0.1:4943";

  const ws = new IcWebSocket(gatewayUrl, undefined, {
    canisterId: canisterId,
    canisterActor: chat_backend,
    identity: identity ? identity : generateRandomIdentity(),
    networkUrl: icUrl,
  });

  return (
    <ContextWrapper.Provider
      value={{
        identity,
        backendActor,
        isAuthenticated,
        ws,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </ContextWrapper.Provider>
  );
};

export default Context;
