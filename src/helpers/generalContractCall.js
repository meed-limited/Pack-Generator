import { Moralis } from "moralis";

const getNameABI = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "_name", type: "string" }],
    stateMutability: "view",
    type: "function"
  }
];

export const getContractName = async (address) => {
  const readOptions = {
    contractAddress: address,
    functionName: "name",
    abi: getNameABI,
    params: {}
  };

  try {
    const data = await Moralis.executeFunction(readOptions);
    return data;
  } catch (error) {
    console.log(error);
  }
};
