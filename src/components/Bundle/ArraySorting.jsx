import cloneDeep from "lodash/cloneDeep";

/* SINGLE BUNDLE: Sorting arrays before feeding contract:
 *********************************************************/
export function sortSingleArrays(ethValue, selectedERC20, selectedNFTs) {
  var assetsAddresses = [];
  var assetsNumbers = [];
  var ERC20Addr = [];
  var ERC721Addr = [];
  var ERC1155Addr = [];

  // Set ETH amount
  let eth = (ethValue * ("1e" + 18)).toString();
  assetsNumbers.push(eth);

  // Set ERC20 addresses
  for (let i = 0; i < selectedERC20.length; i++) {
    let tmp = selectedERC20[i].data;
    ERC20Addr.push(tmp.token_address);
  }
  assetsNumbers.push(ERC20Addr.length);

  // Set ERC721 addresses
  for (let i = 0; i < selectedNFTs.length; i++) {
    if (selectedNFTs[i].contract_type === "ERC721") {
      ERC721Addr.push(selectedNFTs[i].token_address);
    }
  }
  assetsNumbers.push(ERC721Addr.length);

  // Set ERC1155 addresses
  for (let i = 0; i < selectedNFTs.length; i++) {
    if (selectedNFTs[i].contract_type === "ERC1155") {
      ERC1155Addr.push(selectedNFTs[i].token_address);
    }
  }
  assetsNumbers.push(ERC1155Addr.length);
  assetsAddresses = assetsAddresses.concat(ERC20Addr, ERC721Addr, ERC1155Addr);

  // Set ERC20 amounts
  for (let i = 0; i < selectedERC20.length; i++) {
    let tmp = (selectedERC20[i].value * ("1e" + 18)).toString();
    assetsNumbers.push(tmp);
  }

  // Set ERC721 ids
  for (let i = 0; i < selectedNFTs.length; i++) {
    if (selectedNFTs[i].contract_type === "ERC721") {
      let tmp = selectedNFTs[i].token_id;
      assetsNumbers.push(tmp);
    }
  }

  // Set ERC1155 ids && amounts
  for (let i = 0; i < selectedNFTs.length; i++) {
    if (selectedNFTs[i].contract_type === "ERC1155") {
      let tmpID = selectedNFTs[i].token_id;
      let tmpAmount = selectedNFTs[i].amount;
      assetsNumbers.push(tmpID, tmpAmount);
    }
  }
  var data = [assetsAddresses, assetsNumbers];
  return data;
}

/* MULTIPLE BUNDLES: Sorting arrays before feeding contract:
 ************************************************************/
export function sortMultipleArrays(ethValue, selectedERC20, importedJson, numOfErc721, numOfErc1155) {
  var assetsAddresses = [];
  var assetsNumbers = [];
  var numOfNft = parseInt(numOfErc721) + parseInt(numOfErc1155);

  // Set ETH amount
  let eth = (ethValue * ("1e" + 18)).toString();
  assetsNumbers.push(eth);

  // Set ERC20 addresses
  if (selectedERC20 && selectedERC20.length > 0) {
    for (let i = 0; i < selectedERC20.length; i++) {
      let tmp = selectedERC20[i].data;
      assetsAddresses.push(tmp.token_address);
    }
  }
  assetsNumbers.push(assetsAddresses.length, parseInt(numOfErc721), parseInt(numOfErc1155));

  if (importedJson && importedJson.length > 0) {
    try {
      // Set ERC721 addresses (per bundle)
      if (numOfErc721 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC721") {
            assetsAddresses.push(importedJson[i].token_address);
          }
        }
      }
      // Set ERC1155 addresses (per bundle)
      if (numOfErc1155 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC1155") {
            assetsAddresses.push(importedJson[i].token_address);
          }
        }
      }
      // Set ERC20 Amounts
      if (selectedERC20 && selectedERC20.length > 0) {
        for (let i = 0; i < selectedERC20.length; i++) {
          let tmp = (selectedERC20[i].value * ("1e" + 18)).toString();
          assetsNumbers.push(tmp);
        }
      }
      // Set ERC721 ids (per bundle)
      if (numOfErc721 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC721") {
            let tmp = importedJson[i].token_id;
            assetsNumbers.push(tmp);
          }
        }
      }
      // Set ERC1155 ids (per bundle)
      if (numOfErc1155 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC1155") {
            let tmpId = importedJson[i].token_id;
            let tmpAmt = importedJson[i].amount;
            assetsNumbers.push(tmpId, tmpAmt);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    try {
      // Set ERC20 Amounts
      if (selectedERC20 && selectedERC20.length > 0) {
        for (let i = 0; i < selectedERC20.length; i++) {
          let tmp = (selectedERC20[i].value * ("1e" + 18)).toString();
          assetsNumbers.push(tmp);
        }
      }
      //assetsAddresses.push('0');
    } catch (error) {
      console.log(error);
    }
  }

  var data = [assetsAddresses, assetsNumbers];
  return data;
}

/* MULTIPLE BUNDLES: Updating token IDs before feeding contract:
 ****************************************************************/
export function updateTokenIdsInArray(importedJson, multiNumArr, bundleNum) {
  var arrOfArr = [];

  if (importedJson && importedJson.length > 0) {
    const numOfERC20 = multiNumArr[1];
    var firstNFTIndex = 4 + parseInt(numOfERC20);

    var k = 0;
    for (let i = 0; i < bundleNum; i++) {
      let arr = cloneDeep(multiNumArr);

      for (let j = firstNFTIndex; j < arr.length; j++) {
        var value = importedJson[k].token_id;
        arr[j] = value;

        if (importedJson[k].contract_type === "ERC1155") {
          var amount = importedJson[k].amount;
          arr[j + 1] = amount;
          j++;
        }
        k++;
      }
      arrOfArr.push(arr);
    }
  } else {
    for (let i = 0; i < bundleNum; i++) {
      arrOfArr[i] = multiNumArr;
    }
  }
  return arrOfArr;
}
