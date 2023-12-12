// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import "../utils/Molecule.sol";
import "solidity-rlp/contracts/RLPReader.sol";

using Molecule for bytes;
using RLPReader for bytes;
using RLPReader for RLPReader.RLPItem;

struct Proof {
    uint32[] indices;
    bytes32[] lemmas;
    bytes32[] leaves;
}

struct VerifyProofPayload {
    uint8 verifyType;
    bytes32 transactionsRoot;
    bytes32 witnessesRoot;
    bytes32 rawTransactionsRoot;
    Proof proof;
}

struct AxonObjectProof {
    bytes ckbTransaction;
    bytes32 blockHash;
    VerifyProofPayload proofPayload;
}

struct CKBHeader {
    uint32 version;
    uint32 compactTarget;
    uint64 timestamp;
    uint64 number;
    uint64 epoch;
    bytes32 parentHash;
    bytes32 transactionsRoot;
    bytes32 proposalsHash;
    bytes32 extraHash;
    bytes32 dao;
    uint128 nonce;
    bytes extension;
    bytes32 blockHash;
}

// Define the MsgType enum
enum MsgType {
    MsgClientCreate
}

// Define the CommitmentKV struct
struct CommitmentKV {
    uint256 key;
    uint256 value;
}

// Define the Envelope struct
struct Envelope {
    MsgType msg_type;
    CommitmentKV[] commitments;
    bytes content;
}

contract CkbLightClient {
    event GetHeaderEvent(CKBHeader);
    event NotGetHeaderEvent();

    function getHeader(
        bytes32 blockHash
    ) public virtual returns (CKBHeader memory) {
        // axon_precompile_address(0x02)
        address get_header_addr = address(0x0102);
        (bool isSuccess, bytes memory res) = get_header_addr.staticcall(
            abi.encode(blockHash)
        );

        CKBHeader memory header;
        if (isSuccess) {
            header = abi.decode(res, (CKBHeader));
            emit GetHeaderEvent(header);
        } else {
            emit NotGetHeaderEvent();
        }
        return header;
    }
}

// Define ckb blake2b
contract Blake2b {
    function blake2b(bytes memory data) public view returns (bytes32) {
        // axon_precompile_address(0x06)
        address blake2b_addr = address(0x0106);
        (bool isSuccess, bytes memory res) = blake2b_addr.staticcall(
            abi.encode(data)
        );

        bytes32 hash;
        if (isSuccess) {
            hash = abi.decode(res, (bytes32));
        }
        return hash;
    }
}

contract CkbMbt {
    function verify(
        VerifyProofPayload memory payload
    ) public view returns (bool) {
        // axon_precompile_address(0x07)
        address ckb_mbt_addr = address(0x0107);
        (bool isSuccess, bytes memory res) = ckb_mbt_addr.staticcall(
            abi.encode(payload)
        );

        uint8[] memory verify_success;
        if (isSuccess) {
            verify_success = abi.decode(res, (uint8[]));
        } else {
            return false;
        }
        return verify_success[0] == 1;
    }
}

function parseProof(
    bytes memory abiEncodedProof
) pure returns (AxonObjectProof memory) {
    AxonObjectProof memory proof = abi.decode(
        abiEncodedProof,
        (AxonObjectProof)
    );
    return proof;
}

function calculateHashes(
    bytes memory ckbTransaction
) view returns (bytes32 transactionHash, bytes32 witnessHash) {
    // Calculate the hashes here
    (uint256 offset, uint256 size) = ckbTransaction.readCKBTxRaw();
    bytes memory raw_tx = new bytes(size);
    for (uint i = 0; i < size; i++) {
        raw_tx[i] = ckbTransaction[i + offset];
    }

    Blake2b blake2b;
    return (blake2b.blake2b(raw_tx), blake2b.blake2b(ckbTransaction));
}

function decodeRlpEnvelope(
    bytes memory rlpEncodedData
) pure returns (Envelope memory) {
    RLPReader.RLPItem[] memory ls = rlpEncodedData.toRlpItem().toList();

    // Decode the msg_type
    MsgType msg_type = MsgType(ls[0].toUint());

    // Decode the commitments
    RLPReader.RLPItem[] memory commitmentsRlp = ls[1].toList();
    CommitmentKV[] memory commitments;
    for (uint i = 0; i < commitmentsRlp.length; i++) {
        RLPReader.RLPItem[] memory kvRlp = commitmentsRlp[i].toList();
        commitments[i] = CommitmentKV(kvRlp[0].toUint(), kvRlp[1].toUint());
    }

    // Decode the content
    bytes memory content = ls[2].toBytes();

    // Return the decoded Envelope
    return Envelope(msg_type, commitments, content);
}

function parseCommitment(
    bytes memory ckbTransaction
) pure returns (CommitmentKV[] memory) {
    uint256 witness_count = ckbTransaction.readCKBTxWitnessCount();
    uint8 output_type_index = 2;
    (uint256 offset, uint256 size) = ckbTransaction.readCKBTxWitness(
        uint8(witness_count),
        output_type_index
    );
    bytes memory output_type_bytes = new bytes(size);
    for (uint i = 0; i < size; i++) {
        output_type_bytes[i] = ckbTransaction[i + offset];
    }
    Envelope memory witness_struct = decodeRlpEnvelope(output_type_bytes);
    return witness_struct.commitments;
}

function verifyHashExist(
    bytes32[] memory leaves,
    bytes32 witnessHash
) pure returns (bool) {
    bool isInLeaves = false;
    for (uint i = 0; i < leaves.length; i++) {
        if (leaves[i] == witnessHash) {
            isInLeaves = true;
            break;
        }
    }

    return isInLeaves;
}

function isCommitInCommitments(
    CommitmentKV[] memory commitments,
    bytes memory key,
    bytes calldata value
) pure returns (bool) {
    uint256 keyHash = uint256(keccak256(key));
    uint256 valueHash = uint256(keccak256(value));
    for (uint i = 0; i < commitments.length; i++) {
        if (
            commitments[i].key == keyHash && commitments[i].value == valueHash
        ) {
            return true;
        }
    }
    return false;
}

// import "hardhat/console.sol";

library CkbProof {
//     constructor() {
//   logger.log("CkbProof deployed");
// }

    function verifyProof(
        bytes memory abiEncodedProof,
        bytes memory path,
        bytes calldata value
    ) public returns (bool) {
        // Parse the proof from the abi encoded data
        AxonObjectProof memory axonObjProof = parseProof(abiEncodedProof);

        // Get the CKB header
        CkbLightClient lightClient;
        CKBHeader memory header = lightClient.getHeader(axonObjProof.blockHash);

        // Calculate the transaction hash and witness hash
        (, bytes32 witnessHash) = calculateHashes(axonObjProof.ckbTransaction);

        // Check if the witness hash is in the leaves
        if (
            !verifyHashExist(
                axonObjProof.proofPayload.proof.leaves,
                witnessHash
            )
        ) {
            return false;
        }

        // Create the VerifyProofPayload
        VerifyProofPayload memory payload = VerifyProofPayload({
            verifyType: axonObjProof.proofPayload.verifyType,
            transactionsRoot: header.transactionsRoot,
            witnessesRoot: axonObjProof.proofPayload.witnessesRoot,
            rawTransactionsRoot: axonObjProof.proofPayload.rawTransactionsRoot,
            proof: axonObjProof.proofPayload.proof
        });

        // Verify the proof
        CkbMbt ckbMbt;
        if (!ckbMbt.verify(payload)) {
            return false;
        }

        // Parse the commitment from the witness
        CommitmentKV[] memory commitments = parseCommitment(
            axonObjProof.ckbTransaction
        );

        // Check if the commitment path/value matches the provided path/value
        return isCommitInCommitments(commitments, path, value);
    }
}
