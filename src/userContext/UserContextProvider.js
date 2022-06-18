import React from "react";
import { useMoralis } from "react-moralis";
import UserContext from "./context";
import { getAssemblyAddress, getFactoryAddress, getMarketplaceAddress } from "helpers/getContractAddresses";
import { menuItems } from "components/Chains/Chains";

function UserDataProvider({ children }) {
  const { account, chainId } = useMoralis();

  const assemblyAddress = getAssemblyAddress(chainId);
  const marketAddress = getMarketplaceAddress(chainId);
  const factoryAddress = getFactoryAddress(chainId);

  const onSupportedChain = menuItems?.filter((item) => item.key === chainId).length > 0;

  return (
    <UserContext.Provider
      value={{
        chainId,
        account,
        assemblyAddress,
        marketAddress,
        factoryAddress,
        onSupportedChain
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

function useUserData() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
}

export { UserDataProvider, useUserData };
