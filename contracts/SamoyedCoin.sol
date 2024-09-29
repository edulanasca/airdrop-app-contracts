// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract Samoyedcoin is ERC20, ERC20Pausable, Ownable, ERC20Permit {
    address public airdropContract;
    mapping(address => bool) public admins;

    constructor(address initialOwner)
        ERC20("Samoyedcoin", "SAMO")
        Ownable(initialOwner)
        ERC20Permit("Samoyedcoin")
    {
        admins[initialOwner] = true;
    }

    function setAirdropContract(address _airdropContract) external onlyOwner {
        airdropContract = _airdropContract;
    }

    function setAdmin(address admin, bool isAdmin) external onlyOwner {
        admins[admin] = isAdmin;
    }

    function pause() public {
        require(admins[msg.sender], "Not authorized to pause");
        _pause();
    }

    function unpause() public {
        require(admins[msg.sender], "Not authorized to unpause");
        _unpause();
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner() || msg.sender == airdropContract, "Not authorized to mint");
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}