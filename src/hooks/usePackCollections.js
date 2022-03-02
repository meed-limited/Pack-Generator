import { useEffect, useState } from "react";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import { useContractAddress } from "hooks/useContractAddress";
import { useSynchronousState } from "@toolz/use-synchronous-state";

export const usePackCollections = () => {
  const contractProcessor = useWeb3ExecuteFunction();
  const { Moralis } = useMoralis();
  Moralis.enableWeb3()
  const { getAssemblyAddress, getFactoryAddress } = useContractAddress();
  const factoryAddress = getFactoryAddress();
  const [numberOfCollection, setNumberOfCollection] = useSynchronousState(0);
  const [packCollections, setPackCollections] = useState([]);
  const { factoryABI } = useMoralisDapp();
  const factoryABIJson = JSON.parse(factoryABI);

  const getAmountOfCustomCollection = async () => {
    const ops = {
      contractAddress: factoryAddress,
      functionName: "numberOfCustomCollections",
      abi: factoryABIJson
    };

    await contractProcessor.fetch({
      params: ops,
      onSuccess: (response) => {
        setNumberOfCollection(response);
      },
      onError: (error) => {
        console.log(error);
      }
    });
  };

  const getArrayOfCollectionAddresses = async (num) => {
    var assemblyAddress = await getAssemblyAddress();
    if (!assemblyAddress) {
        await getAssemblyAddress();
    }
    var assemblyAddressLower = assemblyAddress.toLowerCase();
    var collectionAddressArray = [];

    for (let i = 0; i < num; i++) {
      const ops = {
        contractAddress: factoryAddress,
        functionName: "customCollectionList",
        abi: factoryABIJson,
        params: {
          "": [i]
        }
      };

      await contractProcessor.fetch({
        params: ops,
        onSuccess: (response) => {
          collectionAddressArray[i] = response.toLowerCase();
        },
        onError: (error) => {
          console.log(error);
        }
      });
    }
    collectionAddressArray = collectionAddressArray.concat(assemblyAddressLower);
    return collectionAddressArray;
  };

  const getPackCollection = async () => {
    await getAmountOfCustomCollection();
    const num = numberOfCollection();
    const result = await getArrayOfCollectionAddresses(num);
    setPackCollections(result);
  };

  useEffect(() => {
    async function waitForArray() {
      await getPackCollection();
    }
    waitForArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { packCollections };
};
