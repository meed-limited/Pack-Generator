import { useState } from "react";
import { useIPFS } from "./useIPFS";

/**
 * This is a hook that loads the NFT metadata in case it doesn't alreay exist
 * If metadata is missing, the object is replaced with a reactive object that updatees when the data becomes available
 * The hook will retry until request is successful (with OpenSea, for now)
 */
export const useVerifyMetadata = () => {
  const { resolveLink } = useIPFS();
  const [results, setResults] = useState({});

  /**
   * Fet Metadata  from NFT and Cache Results
   * @param {object} NFT
   * @returns NFT
   */
  function verifyMetadata(NFT) {
    //Pass Through if Metadata already present
    if (NFT.metadata) return NFT;
    //Get the Metadata
    getMetadata(NFT);
    //Return Hooked NFT Object
    return results?.[NFT.token_uri] ? results?.[NFT.token_uri] : NFT;
  } //verifyMetadata()

  /**
   * Extract Metadata from NFT,
   *  Fallback: Fetch from URI
   * @param {object} NFT
   * @returns void
   */
  async function getMetadata(NFT) {
    //Validate URI
    if (!NFT.token_uri || !NFT.token_uri.includes("://")) {
      return;
    }
    //Get Metadata
    fetch(NFT.token_uri)
      .then((res) => res.json())
      .then((metadata) => {
        if (!metadata) {
          console.error("useVerifyMetadata.getMetadata() No Metadata found on URI:", { URI: NFT.token_uri, NFT });
        }
        //Handle Setbacks
        else if (metadata?.detail && metadata.detail.includes("Request was throttled")) {
          //Retry That Again after 1s
          setTimeout(function () {
            getMetadata(NFT);
          }, 1000);
        } //Handle Opensea's {detail: "Request was throttled. Expected available in 1 second."}
        else {
          //No Errors
          //Set
          setMetadata(NFT, metadata);
        } //Valid Result
      })
      .catch((err) => {
        console.error("useVerifyMetadata.getMetadata() Error Caught:", {
          err,
          NFT,
          URI: NFT.token_uri,
        });
      });
  } //getMetadata()

  /**
   * Update NFT Object
   * @param {object} NFT
   * @param {object} metadata
   */
  function setMetadata(NFT, metadata) {
    //Add Metadata
    NFT.metadata = metadata;
    //Set Image
    if (metadata?.image) NFT.image = resolveLink(metadata.image);
    //Set to State
    if (metadata && !results[NFT.token_uri]) setResults({ ...results, [NFT.token_uri]: NFT });
  } //setMetadata()

  return { verifyMetadata };
}; //useVerifyMetadata()
