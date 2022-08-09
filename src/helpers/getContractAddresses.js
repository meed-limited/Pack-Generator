import {
  assemblyAddressBSC,
  assemblyAddressEthereum,
  assemblyAddressMumbai,
  assemblyAddressPolygon,
  factoryAddressBSC,
  factoryAddressEthereum,
  factoryAddressMumbai,
  factoryAddressPolygon,
  marketAddressBSC,
  marketAddressEthereum,
  marketAddressMumbai,
  marketAddressPolygon,
} from "constant/constant";

/* GET CONTRACT ADDRESS FUNCTION:
 **********************************/
export const getAssemblyAddress = (chainId) => {
  if (chainId === "0x1") {
    return assemblyAddressEthereum;
  } else if (chainId === "0x89") {
    return assemblyAddressPolygon;
  } else if (chainId === "0x38") {
    return assemblyAddressBSC;
  } else if (chainId === "0x13881") {
    return assemblyAddressMumbai;
  }
};

export const getMarketplaceAddress = (chainId) => {
  if (chainId === "0x1") {
    return marketAddressEthereum;
  } else if (chainId === "0x89") {
    return marketAddressPolygon;
  } else if (chainId === "0x38") {
    return marketAddressBSC;
  } else if (chainId === "0x13881") {
    return marketAddressMumbai;
  }
};

export const getFactoryAddress = (chainId) => {
  if (chainId === "0x1") {
    return factoryAddressEthereum;
  } else if (chainId === "0x89") {
    return factoryAddressPolygon;
  } else if (chainId === "0x38") {
    return factoryAddressBSC;
  } else if (chainId === "0x13881") {
    return factoryAddressMumbai;
  }
};
