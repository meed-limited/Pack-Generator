// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/IAssemblyNFT.sol";

contract CustomAssemblyNFT is ERC721, ERC721Holder, ERC1155Holder, IAssemblyNFT, Ownable {
    using SafeERC20 for IERC20;

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC1155Receiver)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            ERC1155Receiver.supportsInterface(interfaceId);
    }

    uint256 public maxBundleSupply;
    uint256 nonce;

    event BatchAssemblyAsset(
        address indexed firstHolder,
        uint256 amountOfBundles
    );

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxBundleSupply,
        address _owner
    ) ERC721(_name, _symbol) {
        maxBundleSupply = _maxBundleSupply;
        transferOwnership(_owner);
    }

    /**
     * layout of _addresses:
     *     erc20 addresses | erc721 addresses | erc1155 addresses
     * layout of _numbers:
     *     eth | erc20.length | erc721.length | erc1155.length | erc20 amounts | erc721 ids | erc1155 ids | erc1155 amounts
     */

    function hash(
        uint256 _salt,
        address[] memory _addresses,
        uint256[] memory _numbers
    ) public pure override returns (uint256 tokenId) {
        bytes32 signature = keccak256(abi.encodePacked(_salt));
        for (uint256 i = 0; i < _addresses.length; i++) {
            signature = keccak256(abi.encodePacked(signature, _addresses[i]));
        }
        for (uint256 j = 0; j < _numbers.length; j++) {
            signature = keccak256(abi.encodePacked(signature, _numbers[j]));
        }
        assembly {
            tokenId := signature
        }
    }

    function mint(
        address _to,
        address[] memory _addresses,
        uint256[] memory _numbers
    ) external payable override onlyOwner returns (uint256 tokenId) {
        require(_to != address(0), "can't mint to address(0)");
        require(msg.value == _numbers[0], "value not match");
        require(
            _addresses.length == _numbers[1] + _numbers[2] + _numbers[3],
            "2 array length not match"
        );
        require(
            _addresses.length == _numbers.length - 4 - _numbers[3],
            "numbers length not match"
        );
        if (maxBundleSupply != 0) {
            require(nonce < maxBundleSupply, "Max supply reached");
        }
        uint256 pointerA; //points to first erc20 address, if there is any
        uint256 pointerB = 4; //points to first erc20 amount, if there is any
        for (uint256 i = 0; i < _numbers[1]; i++) {
            require(_numbers[pointerB] > 0, "transfer erc20 0 amount");
            IERC20(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB++]
            );
        }
        for (uint256 j = 0; j < _numbers[2]; j++) {
            IERC721(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB++]
            );
        }
        for (uint256 k = 0; k < _numbers[3]; k++) {
            IERC1155(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB],
                _numbers[_numbers[3] + pointerB++],
                ""
            );
        }
        tokenId = hash(nonce, _addresses, _numbers);
        super._mint(_to, tokenId);
        emit AssemblyAsset(_to, tokenId, nonce, _addresses, _numbers);
        nonce++;
    }

    function safeMint(
        address _to,
        address[] memory _addresses,
        uint256[] memory _numbers
    ) external payable override onlyOwner returns (uint256 tokenId) {
        require(_to != address(0), "can't mint to address(0)");
        require(msg.value == _numbers[0], "value not match");
        require(
            _addresses.length == _numbers[1] + _numbers[2] + _numbers[3],
            "2 array length not match"
        );
        require(
            _addresses.length == _numbers.length - 4 - _numbers[3],
            "numbers length not match"
        );
        if (maxBundleSupply != 0) {
            require(nonce < maxBundleSupply, "Max supply reached");
        }
        uint256 pointerA; //points to first erc20 address, if there is any
        uint256 pointerB = 4; //points to first erc20 amount, if there is any
        for (uint256 i = 0; i < _numbers[1]; i++) {
            require(_numbers[pointerB] > 0, "transfer erc20 0 amount");
            IERC20 token = IERC20(_addresses[pointerA++]);
            uint256 orgBalance = token.balanceOf(address(this));
            token.safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB]
            );
            _numbers[pointerB++] = token.balanceOf(address(this)) - orgBalance;
        }
        for (uint256 j = 0; j < _numbers[2]; j++) {
            IERC721(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB++]
            );
        }
        for (uint256 k = 0; k < _numbers[3]; k++) {
            IERC1155(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB],
                _numbers[_numbers[3] + pointerB++],
                ""
            );
        }
        tokenId = hash(nonce, _addresses, _numbers);
        super._mint(_to, tokenId);
        emit AssemblyAsset(_to, tokenId, nonce, _addresses, _numbers);
        nonce++;
    }

    function burn(
        address _to,
        uint256 _tokenId,
        uint256 _salt,
        address[] calldata _addresses,
        uint256[] calldata _numbers
    ) external override {
        require(_msgSender() == ownerOf(_tokenId), "not owned");
        require(_tokenId == hash(_salt, _addresses, _numbers));
        super._burn(_tokenId);
        payable(_to).transfer(_numbers[0]);
        uint256 pointerA; //points to first erc20 address, if there is any
        uint256 pointerB = 4; //points to first erc20 amount, if there is any
        for (uint256 i = 0; i < _numbers[1]; i++) {
            require(_numbers[pointerB] > 0, "transfer erc20 0 amount");
            IERC20(_addresses[pointerA++]).safeTransfer(
                _to,
                _numbers[pointerB++]
            );
        }
        for (uint256 j = 0; j < _numbers[2]; j++) {
            IERC721(_addresses[pointerA++]).safeTransferFrom(
                address(this),
                _to,
                _numbers[pointerB++]
            );
        }
        for (uint256 k = 0; k < _numbers[3]; k++) {
            IERC1155(_addresses[pointerA++]).safeTransferFrom(
                address(this),
                _to,
                _numbers[pointerB],
                _numbers[_numbers[3] + pointerB++],
                ""
            );
        }

        emit AssemblyAssetClaimed(_tokenId, msg.sender, _addresses, _numbers);
    }

    function _batchMint(
        address _to,
        address[] memory _addresses,
        uint256[] memory _numbers
    ) public payable onlyOwner returns (uint256 tokenId) {
        require(
            _addresses.length == _numbers[1] + _numbers[2] + _numbers[3],
            "2 array length not match"
        );
        require(
            _addresses.length == _numbers.length - 4 - _numbers[3],
            "numbers length not match"
        );
        uint256 pointerA; //points to first erc20 address, if there is any
        uint256 pointerB = 4; //points to first erc20 amount, if there is any
        for (uint256 i = 0; i < _numbers[1]; i++) {
            require(_numbers[pointerB] > 0, "transfer erc20 0 amount");
            IERC20(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB++]
            );
        }
        for (uint256 j = 0; j < _numbers[2]; j++) {
            IERC721(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB++]
            );
        }
        for (uint256 k = 0; k < _numbers[3]; k++) {
            IERC1155(_addresses[pointerA++]).safeTransferFrom(
                _msgSender(),
                address(this),
                _numbers[pointerB],
                _numbers[_numbers[3] + pointerB++],
                ""
            );
        }
        tokenId = hash(nonce, _addresses, _numbers);
        super._mint(_to, tokenId);
        emit AssemblyAsset(_to, tokenId, nonce, _addresses, _numbers);
        nonce++;
    }

    function batchMint(
        address _to,
        address[] memory _addresses,
        uint256[][] memory _arrayOfNumbers,
        uint256 _amountOfBundles
    ) external payable onlyOwner {
        require(_to != address(0), "can't mint to address(0)");
        uint256 totalEth = _arrayOfNumbers[0][0] * _amountOfBundles;
        require(msg.value == totalEth, "value not match");
        if (maxBundleSupply != 0) {
            require(nonce + _amountOfBundles <= maxBundleSupply, "Max supply reached");
        }

        for (uint256 i = 0; i < _amountOfBundles; i++) {
            _batchMint(_to, _addresses, _arrayOfNumbers[i]);
        }

        emit BatchAssemblyAsset(_to, _amountOfBundles);
    }
}
