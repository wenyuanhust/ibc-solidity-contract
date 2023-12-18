const Molecule = artifacts.require("Molecule");
// const CkbLightClient = artifacts.require('CkbLightClient');
const CkbLightClientMock = artifacts.require('CkbLightClientMock');
const CkbProof = artifacts.require("CkbProof");

const CkbClient = artifacts.require("CkbClient");

const fs = require('fs');
const proof_path = require('path');
const ethers = require('ethers');

contract("CkbProof", (accounts) => {
  it("test testproof", async () => {
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
    // console.log(ckbProofInstance);
    await CkbClient.link(ckbProofInstance);

    console.log("rlpEncodedProof");
    const hexString = "0xf8f3a00202020202020202020202020202020202020202020202020202020202020202a00303030303030303030303030303030303030303030303030303030303030303f8af0da00404040404040404040404040404040404040404040404040404040404040404a00505050505050505050505050505050505050505050505050505050505050505a00606060606060606060606060606060606060606060606060606060606060606f849c481ff81ffe1a00f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0fe1a00e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e0e";
    console.log("hexString len ", hexString.length);
    const rlpEncodedProof = web3.utils.hexToBytes(hexString);
    console.log("rlpEncodedProof len ", rlpEncodedProof.length);

    // const result = await ckbProofInstance.decodeTestProof(rlpEncodedProof);
    const result = await ckbProofInstance.decodeAxonObjectProof(rlpEncodedProof);
    console.log("decodeTestProof ", result);
  });
});
