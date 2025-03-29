import {
  Actor,
  ActorSubclass,
  HttpAgent,
  Identity,
  SignIdentity,
} from "@dfinity/agent";
import React, { FC, createContext, useContext, useEffect, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import {
  canisterId,
  chat_backend as backend,
  idlFactory,
} from "../../../declarations/chat_backend";
import { IcWebSocket } from "ic-websocket-js";
import { gatewayUrl, icUrl, localGatewayUrl, localICUrl } from "../utils/ws";
import type {
  AppMessage,
  _SERVICE,
} from "../../../declarations/chat_backend/chat_backend.did";
import { canisterId as iiCanId } from "../../../declarations/internet_identity";

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
};

const initialContext: Context = {
  identity: null,
  backendActor: null,
  isAuthenticated: false,
  ws: null,
  login: () => { },
  logout: () => { },
};

const ContextWrapper = createContext<Context>(initialContext);

const defaultOptions = {
  createOptions: {
    idleOptions: {
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider: network === "ic"
      ? "https://identity.ic0.app/#authorize"
      : `http://${iiCanId}.localhost:4943`,
  },
};

const useAuthClient = (options = defaultOptions) => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [backendActor, setBackendActor] = useState<ActorSubclass | null>(null);
  const [ws, setWs] = useState<IcWebSocket<_SERVICE, AppMessage> | null>(null);

  useEffect(() => {
    AuthClient.create(options.createOptions).then(async (client) => {
      updateClient(client);
    });
  }, []);

  const login = () => {
    authClient?.login({
      ...options.loginOptions,
      onSuccess: () => {
        updateClient(authClient);
      },
    });
  };

  async function updateClient(client: AuthClient) {
    setAuthClient(client);
    if (await client.isAuthenticated()) {
      const _identity = client.getIdentity();
      setIdentity(_identity);

      let agent = new HttpAgent({
        host: network === "local" ? localhost : host,
        identity: _identity,
      });
      if (network === "local") {
        agent.fetchRootKey();
      }

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
      setWs(_ws);
      setIsAuthenticated(true);
    }
  };

  async function logout() {
    await authClient?.logout();
    if (authClient) {
      await updateClient(authClient);
    }
  }

  return {
    identity,
    backendActor,
    isAuthenticated,
    ws,
    login,
    logout
  }
};

export default Context;

export const AuthProvider = ({ children }) => {
  const auth = useAuthClient();

  return <ContextWrapper.Provider value={auth}>{children}</ContextWrapper.Provider>;
};


export const useAuth = () => {
  return useContext(ContextWrapper);
};
