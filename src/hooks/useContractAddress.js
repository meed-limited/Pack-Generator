import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";

export const useContractAddress = () => {
  const {
    chainId,
    assemblyAddressEthereum,
    assemblyAddressPolygon,
    assemblyAddressMumbai,
    marketAddressEthereum,
    marketAddressPolygon,
    marketAddressMumbai,
    factoryAddressEthereum,
    factoryAddressPolygon,
    factoryAddressMumbai
  } = useMoralisDapp();

  const getAssemblyAddress = () => {
    if (chainId === "0x1") {
      return assemblyAddressEthereum;
    } else if (chainId === "0x89") {
      return assemblyAddressPolygon;
    } else if (chainId === "0x13881") {
      return assemblyAddressMumbai;
    }
  };

  const getMarketplaceAddress = () => {
    if (chainId === "0x1") {
      return marketAddressEthereum;
    } else if (chainId === "0x89") {
      return marketAddressPolygon;
    } else if (chainId === "0x13881") {
      return marketAddressMumbai;
    }
  };

  const getFactoryAddress = () => {
    if (chainId === "0x1") {
      return factoryAddressEthereum;
    } else if (chainId === "0x89") {
      return factoryAddressPolygon;
    } else if (chainId === "0x13881") {
      return factoryAddressMumbai;
    }
  };

  return { getAssemblyAddress, getMarketplaceAddress, getFactoryAddress };
};
