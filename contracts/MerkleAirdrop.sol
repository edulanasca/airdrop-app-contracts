// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SamoyedCoin.sol";

contract MerkleAirdrop is Pausable, Ownable {
    address public immutable token;
    bytes32 public immutable merkleRoot;
    mapping(address => uint256) public claimedAmounts;
    mapping(address => bool) public admins;

    event TokensClaimed(address indexed claimant, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    constructor(address _token, bytes32 _merkleRoot) Ownable(msg.sender) {
        token = _token;
        merkleRoot = _merkleRoot;
        admins[msg.sender] = true; // Set the contract deployer as an admin
    }

    // Function to verify if the user can claim tokens using the Merkle tree
    function verify(
        bytes32[] memory proof,
        address user,
        uint256 totalAssigned
    ) public view returns (bool) {
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(user, totalAssigned)))
        );
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    // Custom errors
    error AmountMustBeGreaterThanZero();
    error InvalidProof();
    error ClaimExceedsAssignedTokens(
        uint256 claimed,
        uint256 attempting,
        uint256 total
    );
    error TransferFailed(string reason);
    error ContractPaused();
    error NotAdmin();

    modifier onlyAdmin() {
        if (!admins[msg.sender]) {
            revert NotAdmin();
        }
        _;
    }

    function addAdmin(address newAdmin) public onlyOwner {
        admins[newAdmin] = true;
        emit AdminAdded(newAdmin);
    }

    function removeAdmin(address adminToRemove) public onlyOwner {
        admins[adminToRemove] = false;
        emit AdminRemoved(adminToRemove);
    }

    function pause() public onlyAdmin {
        _pause();
    }

    function unpause() public onlyAdmin {
        _unpause();
    }

    // Function to claim the assigned tokens using Merkle proof
    function claimTokens(
        uint256 totalAssigned,
        uint256 amountToMint,
        bytes32[] memory proof
    ) external {
        if (paused()) {
            revert ContractPaused();
        }

        if (amountToMint == 0) {
            revert AmountMustBeGreaterThanZero();
        }

        // Verify if the user can claim tokens
        if (!verify(proof, msg.sender, totalAssigned)) {
            revert InvalidProof();
        }

        // Calculate how many tokens are available for the user to claim
        uint256 alreadyClaimed = claimedAmounts[msg.sender];
        console.log("alreadyClaimed: ", alreadyClaimed);
        console.log("totalAssigned: ", totalAssigned);
        console.log("amountToMint: ", amountToMint);
        if (alreadyClaimed + amountToMint > totalAssigned) {
            console.log("Reverting");
            revert ClaimExceedsAssignedTokens(
                alreadyClaimed,
                amountToMint,
                totalAssigned
            );
        }

        console.log("About to mint");
        
        // Mint tokens to this contract first
        try Samoyedcoin(token).mint(address(this), amountToMint) {
            console.log("Minted tokens to MerkleAirdrop contract");
        } catch Error(string memory reason) {
            console.log("Minting failed with reason:", reason);
            revert TransferFailed(string(abi.encodePacked("Minting failed: ", reason)));
        } catch (bytes memory /*lowLevelData*/) {
            console.log("Minting failed with no reason");
            //revert TransferFailed("Minting failed: Unknown error");
        }

        // Now transfer the minted tokens to the user
        try IERC20(token).transfer(msg.sender, amountToMint) returns (bool success) {
            if (!success) {
                console.log("Transfer returned false");
                revert TransferFailed("Transfer returned false");
            }
        } catch Error(string memory reason) {
            console.log("Minting failed with reason:", reason);
            revert TransferFailed(string(abi.encodePacked("Minting failed: ", reason)));
        } catch (bytes memory /*lowLevelData*/) {
            console.log("Minting failed with no reason");
            //revert TransferFailed("Minting failed: Unknown error");
        }

        console.log("Transferred tokens to", msg.sender, amountToMint);

        // Update claimed amount and transfer tokens to the user
        claimedAmounts[msg.sender] += amountToMint;
        emit TokensClaimed(msg.sender, amountToMint);
    }
}
