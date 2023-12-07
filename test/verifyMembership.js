const Molecule = artifacts.require("Molecule");
// const CkbLightClient = artifacts.require('CkbLightClient');
const CkbLightClientMock = artifacts.require('CkbLightClientMock');
const CkbMbt = artifacts.require('CkbMbt');
const Blake2b = artifacts.require('Blake2b');
const CkbProof = artifacts.require("CkbProof");

const fs = require('fs');
const proof_path = require('path');

contract("CkbProof", (accounts) => {
  it("test verifyMembership", async () => {
    const molecule = await Molecule.new();
    console.log("molecule deployed on ", molecule.address);
    await CkbProof.link(molecule.address);

    const ckbLightClient = await CkbLightClientMock.new();
    await CkbProof.link(ckbLightClient.address);
    console.log("ckbLightClient deployed on ", ckbLightClient.address);  

    const ckbMbt = await CkbMbt.new();
    console.log("ckbMbt deployed on ", ckbMbt.address);    
    await CkbProof.link(ckbMbt.address);

    const blake2b = await Blake2b.new();
    await CkbProof.link(blake2b.address);
    console.log("blake2b deployed on ", blake2b.address);

    const ckbProofInstance = await CkbProof.new();
    // const ckbProofInstance = await CkbProof.deployed();
    console.log("CkbProof deployed on ", ckbProofInstance.address);

    console.log("abiEncodedProof");
    const filePath = proof_path.join(__dirname, './hex_object_proof.txt');
    const hexString = fs.readFileSync(filePath, 'utf8');
    console.log("hexString len ", hexString.length);

    const abiEncodedProof = web3.utils.hexToBytes(hexString);
    console.log("abiEncodedProof", abiEncodedProof);
    console.log("Proof in hex:", web3.utils.bytesToHex(abiEncodedProof));

    const path = "0x000";
    const value = "0x77";

    const result = await ckbProofInstance.verifyMembership(abiEncodedProof, path, value);
    
    // Replace `expected` with the expected result
    const expected = true;
    assert.equal(result, expected, "The proof verification did not return the expected result");
  });
});
