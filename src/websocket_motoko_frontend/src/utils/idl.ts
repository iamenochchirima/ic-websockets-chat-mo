import { IDL } from "@dfinity/candid";

type AppMessage = {
    message: string
  }

export const AppMessageIdl = IDL.Record({
  'message': IDL.Text,
});

export const serializeAppMessage = (message: AppMessage): Uint8Array => {
  return new Uint8Array(IDL.encode([AppMessageIdl], [message]));
};

export const deserializeAppMessage = (bytes: Buffer | ArrayBuffer | Uint8Array): AppMessage => {
  return IDL.decode([AppMessageIdl], bytes)[0] as unknown as AppMessage;
};