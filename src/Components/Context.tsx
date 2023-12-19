import { ActorSubclass, Identity, SignIdentity } from "@dfinity/agent";
import React, { FC, createContext, useContext, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  chat_backend,
  createActor,
} from "../declarations/chat_backend";
import IcWebSocket from "ic-websocket-js";
import { gatewayUrl, icUrl } from "../utils/ws";
import type { AppMessage, _SERVICE } from "../declarations/chat_backend/chat_backend.did";
import { canisterId as iiCanId } from "../declarations/internet_identity";

const authClient = await AuthClient.create();

interface LayoutProps {
  children: React.ReactNode;
}

type Context = {
  identity: Identity | null;
  backendActor: ActorSubclass<_SERVICE> | null;
  isAuthenticated: boolean;
  ws: IcWebSocket<_SERVICE, AppMessage> | null;
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
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backendActor, setBackendActor] = useState<ActorSubclass<_SERVICE> | null>(null);
  const [ws, setWs] = useState<IcWebSocket<_SERVICE, AppMessage> | null>(null);

  const login = async () => {
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app"
        : `http://127.0.0.1:4943/?canisterId=${iiCanId}`,
      onSuccess: () => {
        checkAuth();
      },
      onError: (err) => alert(err),
    });
  };

  const checkAuth = async () => {
    try {
      if (await authClient.isAuthenticated()) {
        setIsAuthenticated(true);
        const _identity = authClient.getIdentity();
        setIdentity(_identity);

        // set backend actor
        const _backendActor = createActor(canisterId, { agentOptions: { identity: _identity } });
        setBackendActor(_backendActor);

        // set websocket client
        const _ws = new IcWebSocket(gatewayUrl, undefined, {
          canisterId: canisterId,
          canisterActor: chat_backend,
          identity: _identity as SignIdentity,
          networkUrl: icUrl,
        });
        setWs(_ws);
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
