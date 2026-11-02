"use client";
import { createContext, useContext } from "react";
export type AccountState = { signedIn: boolean; access: boolean };
const AccountContext = createContext<AccountState>({ signedIn: false, access: false });
export const AccountProvider = AccountContext.Provider;
export const useAccount = () => useContext(AccountContext);
