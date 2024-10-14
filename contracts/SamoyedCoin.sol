// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Samoyedcoin is ERC20, Ownable, ERC20Permit {
    address public airdropContract;

    constructor(address initialOwner)
        ERC20("Samoyedcoin", "SAMO")
        Ownable(initialOwner)
        ERC20Permit("Samoyedcoin")
    {}

    function setAirdropContract(address _airdropContract) external onlyOwner {
        airdropContract = _airdropContract;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner() || msg.sender == airdropContract, "Not authorized to mint");
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20)
    {
        super._update(from, to, value);
    }
}