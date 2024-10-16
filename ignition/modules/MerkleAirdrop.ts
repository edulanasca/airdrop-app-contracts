import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import users from "../../users.json";

const MerkleAirdropModule = buildModule("MerkleAirdropModule", (m) => {
    const tree = StandardMerkleTree.of(users.users, ["address", "uint256"]);

    const merkleRoot = m.getParameter("merkleRoot", tree.root);
    const token = m.getParameter("token", "0x67eaB509f24d8Bb60D71FDB6eb98f74A968E58e8");

    const airdrop = m.contract("MerkleAirdrop", [token, merkleRoot]);
    return { airdrop };
});

export default MerkleAirdropModule;