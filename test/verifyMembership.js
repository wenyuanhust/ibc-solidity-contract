const Molecule = artifacts.require("Molecule");
// const CkbLightClient = artifacts.require('CkbLightClient');
const CkbLightClientMock = artifacts.require('CkbLightClientMock');
const CkbMbt = artifacts.require('CkbMbt');
const Blake2b = artifacts.require('Blake2b');
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

    const ckbMbt = await CkbMbt.new();
    console.log("ckbMbt deployed on ", ckbMbt.address);    
    await CkbProof.link(ckbMbt);

    const blake2b = await Blake2b.new();
    console.log("blake2b deployed on ", blake2b.address);
    await CkbProof.link(blake2b);

    const ckbProofInstance = await CkbProof.new();
    console.log("CkbProof deployed on ", ckbProofInstance.address);
    // console.log(ckbProofInstance);
    await CkbClient.link(ckbProofInstance);

    console.log("abiEncodedProof");
    const filePath = proof_path.join(__dirname, './hex_proof.txt');
    const hexString = fs.readFileSync(filePath, 'utf8');
    console.log("hexString len ", hexString.length);

    const abiEncodedProof = web3.utils.hexToBytes(hexString);
    console.log("abiEncodedProof len ", abiEncodedProof.length);
    // console.log("Proof in hex:", web3.utils.bytesToHex(abiEncodedProof));

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
    // const result = await ckbClient.verifyMembership.call("", data, 0, 0, abiEncodedProof, "0x", pathBytes, valueBytes);
    const result = await ckbClient.verifyMembership("", data, 0, 0, abiEncodedProof, "0x", pathBytes, valueBytes);

    assert.equal(result, true, "The proof verification did not return the expected result");

    // library can not call non pure non view function
    // const result = await ckbProofInstance.verifyProof(abiEncodedProof, pathBytes, valueBytes);
    // const expected = true;
    // assert.equal(result, expected, "The proof verification did not return the expected result");
  });
});
