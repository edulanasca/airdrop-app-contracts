import { expect } from "chai";
import hre from "hardhat";
import { MerkleAirdrop, Samoyedcoin } from "../typechain-types";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("MerkleAirdrop", function () {
  let token: Samoyedcoin;
  let airdrop: MerkleAirdrop;
  let tree: StandardMerkleTree<any[]>;
  let merkleRoot: string;
  let owner: any;
  let ac1: any;
  let ac2: any;
  let admin: any;

  before(async function () {
    [owner, ac1, ac2, admin] = await hre.ethers.getSigners();
    
    // Deploy the token contract
    const Token = await hre.ethers.getContractFactory("Samoyedcoin");
    token = await Token.deploy(owner.address);

    // Create Merkle tree
    const leaves = [owner, ac1, ac2].map((account) => [account.address, "5000000000000000000"]);
    tree = StandardMerkleTree.of(leaves, ["address", "uint256"]);
    merkleRoot = tree.root;

    // Deploy the airdrop contract
    const Airdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
    airdrop = await Airdrop.deploy(await token.getAddress(), merkleRoot);

    // Set the airdrop contract address in the token contract
    await token.setAirdropContract(await airdrop.getAddress());

    // Mint tokens to the airdrop contract
    await token.mint(await airdrop.getAddress(), "15000000000000000000"); // 15 tokens for 3 accounts
  });

  it("should add and remove admins", async function () {
    await expect(airdrop.addAdmin(admin.address))
      .to.emit(airdrop, "AdminAdded")
      .withArgs(admin.address);

    expect(await airdrop.admins(admin.address)).to.be.true;

    await expect(airdrop.removeAdmin(admin.address))
      .to.emit(airdrop, "AdminRemoved")
      .withArgs(admin.address);

    expect(await airdrop.admins(admin.address)).to.be.false;
  });

  it("should allow admins to pause and unpause the contract", async function () {
    await airdrop.addAdmin(admin.address);

    await expect(airdrop.connect(admin).pause()).to.not.be.reverted;
    expect(await airdrop.paused()).to.be.true;

    await expect(airdrop.connect(admin).unpause()).to.not.be.reverted;
    expect(await airdrop.paused()).to.be.false;
  });

  it("should not allow non-admins to pause or unpause", async function () {
    await expect(airdrop.connect(ac1).pause()).to.be.revertedWithCustomError(airdrop, "NotAdmin");
    await expect(airdrop.connect(ac1).unpause()).to.be.revertedWithCustomError(airdrop, "NotAdmin");
  });

  it("should not allow claiming tokens when paused", async function () {
    await airdrop.pause();
    const proof = tree.getProof(1);
    await expect(airdrop.connect(ac1).claimTokens("5000000000000000000", "2500000000000000000", proof))
      .to.be.revertedWithCustomError(airdrop, "ContractPaused");
    await airdrop.unpause();
  });

  // Existing tests
  it("should verify a valid proof", async function () {
    const proof = tree.getProof(1);
    expect(await airdrop.verify(proof, ac1.address, "5000000000000000000")).to.be.true;
  });

  it("should not verify an invalid proof", async function () {
    const invalidProof = tree.getProof(2);
    expect(await airdrop.verify(invalidProof, ac1.address, "5000000000000000000")).to.be.false;
  });

  it("should allow claiming tokens with a valid proof", async function () {
    const proof = tree.getProof(1);
    await expect(airdrop.connect(ac1).claimTokens("5000000000000000000", "2500000000000000000", proof))
      .to.emit(airdrop, "TokensClaimed")
      .withArgs(ac1.address, "2500000000000000000");

    expect(await token.balanceOf(ac1.address)).to.equal("2500000000000000000");
  });

  it("should not allow claiming tokens with an invalid proof", async function () {
    const invalidProof = tree.getProof(2);
    await expect(airdrop.connect(ac1).claimTokens("5000000000000000000", "2500000000000000000", invalidProof))
      .to.be.revertedWithCustomError(airdrop, "InvalidProof");
  });

  it("should not allow claiming more tokens than assigned", async function () {
    const proof = tree.getProof(0);
    await airdrop.connect(owner).claimTokens("5000000000000000000", "2500000000000000000", proof);

    await expect(airdrop.connect(owner).claimTokens("5000000000000000000", "2600000000000000000", proof))
      .to.be.revertedWithCustomError(airdrop, "ClaimExceedsAssignedTokens")
      .withArgs("2500000000000000000", "2600000000000000000", "5000000000000000000");
  });

  it("should not allow claiming zero tokens", async function () {
    const proof = tree.getProof(0);
    await expect(airdrop.connect(owner).claimTokens("5000000000000000000", "0", proof))
      .to.be.revertedWithCustomError(airdrop, "AmountMustBeGreaterThanZero");
  });

  it("should allow claiming remaining tokens", async function () {
    const proof = tree.getProof(2);
    await expect(airdrop.connect(ac2).claimTokens("5000000000000000000", "5000000000000000000", proof))
      .to.emit(airdrop, "TokensClaimed")
      .withArgs(ac2.address, "5000000000000000000");

    expect(await token.balanceOf(ac2.address)).to.equal("5000000000000000000");
  });
});
