import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { useEffect, useMemo, useState } from "react";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";
import { useIPFS } from "./useIPFS";

export const useNFTBalance = (options) => {
  const updatedOptions = useMemo(
    () => ({
      ...options,
      offset: options && options.offset ? options.offset : 0,
      limit: options && options.limit ? options.limit : 20
    }),
    [options]
  );

  const { account } = useMoralisWeb3Api();
  const { chainId } = useMoralisDapp();
  const { resolveLink } = useIPFS();
  const [NFTBalance, setNFTBalance] = useState([]);
  const {
    fetch: getNFTBalance,
    data,
    error,
    isLoading
  } = useMoralisWeb3ApiCall(account.getNFTs, { chain: chainId, ...updatedOptions });

  const [fetchSuccess, setFetchSuccess] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const NFTs = data.result;
      setFetchSuccess(true);
      for (let NFT of NFTs) {
        if (NFT?.metadata) {
          NFT.metadata = JSON.parse(NFT.metadata);
          NFT.image = resolveLink(NFT.metadata?.image);
        } else if (NFT?.token_uri) {
          try {
            await fetch(NFT.token_uri)
              .then((response) => response.json())
              .then((data) => {
                NFT.image = resolveLink(data.image);
              });
          } catch (error) {
            setFetchSuccess(false);
          }
        }
      }
      setNFTBalance(NFTs);
    }

    if (data && data.result) {
      fetchData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return {
    getNFTBalance,
    NFTBalance,
    fetchSuccess,
    error,
    isLoading,
    start: updatedOptions.offset + 1,
    end: updatedOptions.limit + updatedOptions.offset
  };
};
