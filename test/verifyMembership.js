const Molecule = artifacts.require("Molecule");
// const CkbLightClient = artifacts.require('CkbLightClient');
const CkbLightClientMock = artifacts.require('CkbLightClientMock');
const CkbProof = artifacts.require("CkbProof");

const CkbClient = artifacts.require("CkbClient");

const fs = require('fs');
const proof_path = require('path');
const ethers = require('ethers');

contract("CkbProof", (accounts) => {
  it("test verifyMembership", async () => {
    const molecule = await Molecule.new();
    console.log("molecule deployed on ", molecule.address);
    await CkbProof.link(molecule);

    const ckbLightClient = await CkbLightClientMock.new();
    console.log("ckbLightClient deployed on ", ckbLightClient.address);
    // the blockNumberHexString can be arbitrary hex
    let blockNumberHexString = "0x2a";
    let blockNumber = ethers.utils.hexZeroPad(blockNumberHexString, 32);
    const header = await ckbLightClient.getHeader(blockNumber);
    console.log("header transactionsRoot", header.transactionsRoot);  
    await CkbProof.link(ckbLightClient);

    const ckbProofInstance = await CkbProof.new();
    console.log("CkbProof deployed on ", ckbProofInstance.address);
    await CkbClient.link(ckbProofInstance);

    console.log("rlpEncodedProof");
    const filePath = proof_path.join(__dirname, './7c57_rlp.txt');
    const hexString = fs.readFileSync(filePath, 'utf8');
    console.log("hexString len ", hexString.length);
    const rlpEncodedProof = web3.utils.hexToBytes(hexString);
    console.log("rlpEncodedProof len ", rlpEncodedProof.length);

    const path = "commitments/ports/ccdefc1fc781b8c1a9a946dfdeeb32829ef2f86e47e8e4d69f6e5bbbb960f42c/channels/channel-0/sequences/1";
    const value = "0xec577607291e6c583bdf479ab7f8b59f851419121e3d116befeeeb0f1b0a4f87";
    const pathBytes = Buffer.from(path);
    const valueBytes = Buffer.from(value.slice(2), 'hex');  // remove the "0x" prefix and convert from hexadecimal

    const ckbClient = await CkbClient.new();
    console.log("ckbClient deployed on ", ckbClient.address);
    // Client Create
    const data = {
      revisionNumber: 0,
      revisionHeight: 0
    };
    const result = await ckbClient.verifyMembership.call("", data, 0, 0, rlpEncodedProof, "0x", pathBytes, valueBytes);
    // const result = await ckbClient.verifyMembership("", data, 0, 0, rlpEncodedProof, "0x", pathBytes, valueBytes);
    assert.equal(result, true, "The proof verification did not return the expected result");
  });
});
