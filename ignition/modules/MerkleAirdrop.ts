import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import users from "../../../users.json";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {
    const tree = StandardMerkleTree.of(users.users, ["address", "uint256"]);

    const merkleRoot = m.getParameter("merkleRoot", tree.root);
    const token = m.getParameter("token", "0x5FbDB2315678afecb367f032d93F642f64180aa3");

    const airdrop = m.contract("MerkleAirdrop", [token, merkleRoot]);
    return { airdrop };
});

export default MerkleAirdropModule;