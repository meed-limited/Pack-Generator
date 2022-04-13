// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "./CustomAssemblyNFT.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @author Pedrojok01
/// @title An ERC721 factory contract to allow user to create custom pack collections.
contract PackFactory is Ownable {
    address[] public customCollectionList; // Array containing all created pack collections addresses
    mapping(string => address) public getCustomCollection; // Map custom Collection address per token symbol

    uint256 public feeETH = 0.01 ether; // Fees passed to each custom collection. Charged per pack if paid in native (ETH, MATIC, BNB)
    uint256 public feeL3P = 100000000000000000000; // Fees passed to each custom collection. Charged per pack if paid in L3P (default === 100 L3P)

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
    function createCustomCollection(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _baseURIextended
    ) external returns (address) {
        require(
            getCustomCollection[_symbol] == address(0),
            "Collection exist already"
        );

        address newCustomCollection = address(
            new CustomAssemblyNFT(
                _name,
                _symbol,
                _maxSupply,
                _baseURIextended,
                feeETH,
                feeL3P,
                msg.sender
            )
        ); // call the ERC721 constructor to create a new custom collection

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

    /**
     @dev This function allow to get the collection address of a given token symbol.
     @param _NftSymbol The symbol of the NFT that the user wish to get the address from.
    */
    function getCustomCollectionAddress(string memory _NftSymbol)
        external
        view
        returns (address)
    {
        return getCustomCollection[_NftSymbol];
    }

    /// @dev This function allow to get the total amount of custom collection created.
    function numberOfCustomCollections() external view returns (uint256) {
        return customCollectionList.length;
    }

    /* Restricted functions:
     *************************/
    /// @dev Allows to edit the fee in native for all future custom collections.
    function setFeeETH(uint256 _newEthFee) external onlyOwner {
        feeETH = _newEthFee;
    }

    /// @dev Allows to edit the fee in L3P for all future custom collections.
    function setFeeL3P(uint256 _newL3PFee) external onlyOwner {
        feeL3P = _newL3PFee;
    }
}
