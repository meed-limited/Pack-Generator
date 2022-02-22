// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "./CustomAssemblyNFT.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @author Pedrojok01
/// @title An ERC721 factory contract to allow user to create custom bundle collections.
contract BundleFactory {

    address[] public customCollectionList; // Array containing all created bundle collections addresses
    mapping(string => address) public getCustomCollection; // Map custom Collection address per token symbol

    event NewCustomCollectionCreated(
        address owner,
        address indexed newCustomCollection,
        string indexed newNFT,
        string indexed newNFTsymbol,
        uint256 customCollection_id
    );

    /** 
     @dev This function is called when a user wish to create a new custom collection, generate a new token ERC721 contract.
     @param _name The name of the new collection. Can be chosen by user input.
     @param _symbol The symbol of the new collection. Can be chosen by user input.
    */
    function createCustomCollection(string memory _name, string memory _symbol, uint _maxSupply)
        public
        returns (address)
    {
        require(
            getCustomCollection[_symbol] == address(0),
            "Collection exist already"
        );

        address newCustomCollection = address(new CustomAssemblyNFT(_name, _symbol, _maxSupply, msg.sender)); // call the ERC721 constructor to create a new custom collection

        getCustomCollection[_symbol] = newCustomCollection;
        customCollectionList.push(newCustomCollection);
        
        emit NewCustomCollectionCreated(
            msg.sender,
            newCustomCollection,
            _name,
            _symbol,
            customCollectionList.length
        );
        return newCustomCollection;
    }

    /// @dev This function allow to get the collection address of a given token symbol.
    /// @param _NftSymbol The symbol of the NFT that the user wish to get the address from.
    function getCustomCollectionAddress(string memory _NftSymbol)
        external
        view
        returns (address)
    {
        address CustomCollectionAddress = getCustomCollection[_NftSymbol];
        return CustomCollectionAddress;
    }

    /// @dev This function allow to get the total amount of custom collection created.
    function numberOfCustomCollections() external view returns (uint256) {
        return customCollectionList.length;
    }
}
