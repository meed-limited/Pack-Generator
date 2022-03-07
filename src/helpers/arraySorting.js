import cloneDeep from "lodash/cloneDeep";

/* SINGLE PACK: Sorting arrays before feeding contract:
 *******************************************************/
export function sortSingleArrays(ethValue, selectedERC20, selectedNFTs) {
  var assetsAddresses = [];
  var assetsNumbers = [];
  var ERC20Addr = [];
  var ERC721Addr = [];
  var ERC1155Addr = [];
  var counter1155 = 0;

  // Set ETH amount
  let eth = (ethValue * ("1e" + 18)).toString();
  assetsNumbers.push(eth);

  // Set ERC20 addresses
  if (selectedERC20 && selectedERC20.length > 0) {
    for (let i = 0; i < selectedERC20.length; i++) {
      let tmp = selectedERC20[i].data;
      ERC20Addr.push(tmp.token_address);
    }
  }
  assetsNumbers.push(ERC20Addr.length);

  // Set ERC721 addresses
  if (selectedNFTs && selectedNFTs.length > 0) {
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
        counter1155++;
      }
    }
    assetsNumbers.push(ERC1155Addr.length);
  } else {
    assetsNumbers.push(0, 0);
  }

  assetsAddresses = assetsAddresses.concat(ERC20Addr, ERC721Addr, ERC1155Addr);

  // Set ERC20 amounts
  if (selectedERC20 && selectedERC20.length > 0) {
    for (let i = 0; i < selectedERC20.length; i++) {
      let tmp = selectedERC20[i].value * ("1e" + 18);
      assetsNumbers.push(tmp.toString());
    }
  }

  // Set ERC721 ids
  if (selectedNFTs && selectedNFTs.length > 0) {
    for (let i = 0; i < selectedNFTs.length; i++) {
      if (selectedNFTs[i].contract_type === "ERC721") {
        let tmp = selectedNFTs[i].token_id;
        assetsNumbers.push(tmp);
      }
    }

    // Set ERC1155 ids && amounts
    for (let j = 0; j < selectedNFTs.length; j++) {
      if (selectedNFTs[j].contract_type === "ERC1155") {
        let tmpID = selectedNFTs[j].token_id;
        assetsNumbers.push(parseInt(tmpID));
      }
    }
    for (let k = 0; k < counter1155; k++) {
      assetsNumbers.push(1);
    }
  }
  var data = [assetsAddresses, assetsNumbers];
  return data;
}

/* MULTIPLE PACKS: Sorting arrays before feeding contract:
 *********************************************************/
export function sortMultipleArrays(ethValue, selectedERC20, importedJson, numOfErc721, numOfErc1155) {
  var assetsAddresses = [];
  var assetsNumbers = [];
  var numOfNft = parseInt(numOfErc721) + parseInt(numOfErc1155);
  var amountOf1155 = [];

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
      // Set ERC721 addresses (per pack)
      if (numOfErc721 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC721") {
            assetsAddresses.push(importedJson[i].token_address);
          }
        }
      }

      // Set ERC1155 addresses (per pack)
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

      // Set ERC721 ids
      if (numOfErc721 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC721") {
            let tmp = importedJson[i].token_id;
            assetsNumbers.push(tmp);
          }
        }
      }
      // Set ERC1155 ids
      if (numOfErc1155 > 0) {
        for (let i = 0; i < numOfNft; i++) {
          if (importedJson[i].contract_type === "ERC1155") {
            let tmpId = importedJson[i].token_id;
            let tmpAmt = importedJson[i].amount;
            assetsNumbers.push(parseInt(tmpId));
            amountOf1155.push(tmpAmt);
          }
        }
      }
      assetsNumbers = assetsNumbers.concat(amountOf1155);
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
    } catch (error) {
      console.log(error);
    }
  }

  var data = [assetsAddresses, assetsNumbers];
  return data;
}

/* MULTIPLE PACKS: Updating token IDs before feeding contract:
 *************************************************************/
export function updateTokenIdsInArray(importedJson, multiNumArr, packNum, amount1155) {
  var arrOfArr = [];

  if (importedJson && importedJson.length > 0) {
    const numOfERC20 = multiNumArr[1];
    var firstNFTIndex = 4 + parseInt(numOfERC20);
    var k = 0;

    for (let i = 0; i < packNum; i++) {
      let arr = cloneDeep(multiNumArr);
      let first1155Amount = arr.length - amount1155;

      for (let j = firstNFTIndex; j < arr.length - amount1155; j++) {
        arr[j] = importedJson[k].token_id;

        if (importedJson[k].contract_type === "ERC1155") {
          arr[first1155Amount] = importedJson[k].amount;
          first1155Amount++;
        }
        k++;
      }
      arrOfArr.push(arr);
    }
  } else {
    for (let i = 0; i < packNum; i++) {
      arrOfArr[i] = multiNumArr;
    }
  }
  return arrOfArr;
}
