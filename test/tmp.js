const CkbProof = artifacts.require("CkbProof");
const Molecule = artifacts.require("Molecule");

let ckbProof, molecule;
module.exports = function(deployer) {
    deployer.deploy(Molecule);
    deployer.link(Molecule, CkbProof);
  };

contract("CkbProof", accounts => {

  it("should calculate the transaction and witness hash correctly", async () => {
    // Create a sample raw transaction input
    const rawTx = "0x09"; // Replace with your actual raw transaction data

    // // Read offset and size of RawTransaction using Molecule library
    // const { offset, size } = await molecule.readCKBTxRaw(rawTx);

    // // Extract raw transaction data from the input
    // const extractedRawTx = rawTx.slice(offset, offset + size);

    // // Calculate expected hashes using Blake2b
    // const expectedTransactionHash = web3.utils.soliditySha3(extractedRawTx);
    // const expectedWitnessHash = web3.utils.soliditySha3(rawTx);

    // Call the calculateHashes function
    const { transactionHash, witnessHash } = await ckbProof.calculateHashes(rawTx);

    // Compare calculated and expected hashes
    // assert.equal(transactionHash, expectedTransactionHash, "Transaction hash mismatch");
    // assert.equal(witnessHash, expectedWitnessHash, "Witness hash mismatch");
  });
});
