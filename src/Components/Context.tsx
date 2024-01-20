import {
  Actor,
  ActorSubclass,
  HttpAgent,
  Identity,
  SignIdentity,
} from "@dfinity/agent";
import React, { FC, createContext, useContext, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  chat_backend as backend,
  idlFactory,
} from "../declarations/chat_backend";
import IcWebSocket from "ic-websocket-js";
<<<<<<< HEAD:src/chat_frontend/src/Components/Context.tsx
import { gatewayUrl, icUrl, localgatewayUrl, localicUrl } from "../utils/ws";
import type {
  AppMessage,
  _SERVICE,
} from "../../../declarations/chat_backend/chat_backend.did";
import { canisterId as iiCanId } from "../../../declarations/internet_identity";
=======
import { gatewayUrl, icUrl, localGatewayUrl, localICUrl } from "../utils/ws";
import type {
  AppMessage,
  _SERVICE,
} from "../declarations/chat_backend/chat_backend.did";
import { canisterId as iiCanId } from "../declarations/internet_identity";
>>>>>>> vite:src/Components/Context.tsx

const authClient = await AuthClient.create();
const env = process.env.DFX_NETWORK || "local";

const localhost = "http://localhost:3000";
const host = "https://icp0.io";
const network = process.env.DFX_NETWORK || "local"

interface LayoutProps {
  children: React.ReactNode;
}

type Context = {
  identity: Identity | null;
  backendActor: ActorSubclass | null;
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
<<<<<<< HEAD:src/chat_frontend/src/Components/Context.tsx
  const [backendActor, setBackendActor] =
    useState<ActorSubclass<_SERVICE> | null>(null);
=======
  const [backendActor, setBackendActor] = useState<ActorSubclass | null>(null);
>>>>>>> vite:src/Components/Context.tsx
  const [ws, setWs] = useState<IcWebSocket<_SERVICE, AppMessage> | null>(null);

  const login = async () => {
    await authClient.login({
      identityProvider:
<<<<<<< HEAD:src/chat_frontend/src/Components/Context.tsx
        process.env.DFX_NETWORK === "ic"
=======
        network === "ic"
>>>>>>> vite:src/Components/Context.tsx
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
        const _identity = authClient.getIdentity();
        setIdentity(_identity);

<<<<<<< HEAD:src/chat_frontend/src/Components/Context.tsx
        // set backend actor
        const _backendActor = createActor(canisterId, {
          agentOptions: { identity: _identity },
        });
        setBackendActor(_backendActor);

        // set websocket client
        const _ws = new IcWebSocket(
          env === "local" ? localgatewayUrl : gatewayUrl,
          undefined,
          {
            canisterId: canisterId,
            canisterActor: chat_backend,
            identity: _identity as SignIdentity,
            networkUrl: env === "local" ? localicUrl : icUrl,
          }
        );
=======
        let agent = new HttpAgent({
          host: network === "local" ? localhost : host,
          identity: _identity,
        });
        agent.fetchRootKey();

        const _backendActor = Actor.createActor(idlFactory, {
          agent,
          canisterId: canisterId,
        });
        setBackendActor(_backendActor);

        const _ws = new IcWebSocket(network === "local" ? localGatewayUrl : gatewayUrl, undefined, {
          canisterId: canisterId,
          canisterActor: backend,
          identity: _identity as SignIdentity,
          networkUrl: network === "local" ? localICUrl : icUrl,
        });
>>>>>>> vite:src/Components/Context.tsx
        setWs(_ws);
        setIsAuthenticated(true);
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
