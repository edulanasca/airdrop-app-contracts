import { expect } from "chai";
import { Samoyedcoin } from "../typechain-types";
import hre from "hardhat";

describe("Samoyedcoin Contract", function () {
    let samoyedcoin: Samoyedcoin;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();
        
        const Samoyedcoin = await hre.ethers.getContractFactory("Samoyedcoin");
        samoyedcoin = await Samoyedcoin.deploy(owner.address);
    });

    it("Should have correct name and symbol", async function () {
        expect(await samoyedcoin.name()).to.equal("Samoyedcoin");
        expect(await samoyedcoin.symbol()).to.equal("SAMO");
    });

    it("Should mint tokens to an address", async function () {
        await samoyedcoin.mint(addr1.address, 1000);
        expect(await samoyedcoin.balanceOf(addr1.address)).to.equal(1000);
    });
});
