

import { 
  PublicKey, 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Transaction,
  TransactionInstruction, 
  SystemProgram,
  AccountMeta,
  Struct
} from "@solana/web3.js";
import {serialize} from "borsh";
import {Buffer} from "buffer";
import BN from "bn.js";

const devnet = clusterApiUrl("devnet");
const privateConnection = "http://127.0.0.1:8899";
const connection = new Connection(privateConnection, "confirmed");
let toAddress: any = [];
let toAmount: any = [];


class Primitive extends Struct {
  constructor(properties: { ADDRESS: any; AMOUNT: any; }) {
    super(properties);
  }
}

// FOR SIMULATION (receive from pubkey from body)
const signer =  Keypair.fromSecretKey(Uint8Array.from([31,76,102,45,230,167,90,81,188,205,133,162,8,180,157,5,196,145,153,138,175,252,199,30,87,84,41,123,131,105,127,50,174,90,139,71,123,211,49,188,149,93,220,97,44,8,241,44,82,231,185,227,150,51,74,162,213,40,69,203,239,227,16,193]));
const fromPubkey: any = signer.publicKey;
let programId = new PublicKey("87vEaHLVkCCcV8i6Lixmqd3L7M5uzkcLJESnb1g9KuAU");

// FOR SIMULATION (generating accounts and amounts into array)
for(let i=0; i < 5; i++) {
  toAddress.push(Keypair.generate().publicKey.toBase58())
  toAmount.push(i)
}
console.log(toAddress, toAmount)

const addressTotalInt = toAddress.length
const amountTotalInt = toAddress.length
console.log ("total addresses and amounts: ", addressTotalInt, "and",amountTotalInt)


let keyArray = [
  {pubkey: fromPubkey, isSigner: true, isWritable: true},
  {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
]

const data = new Primitive({
  ADDRESS: toAddress,
  AMOUNT: toAmount
})

class Payload {
  public data_length: BN;
  public addresses: string[];
  public amounts: BN[];

  constructor(addresses: string[], amounts: number[]) {
    this.addresses = addresses;
    this.amounts = amounts.map(x => new BN(x));
    this.data_length = new BN(addresses.length);
  }

  serialize() { 
    const numOfAddresses = this.addresses.length;
    const numOfAmounts = this.amounts.length;
    const schema = new Map([
      [
        Payload, 
        {
          kind: "struct",
          fields: [
            ["data_length", "u32"],
            ["addresses", ["string", numOfAddresses]],
            ["amounts", ["u32", numOfAmounts]]
          ]
        }
      ]
    ])

    return serialize(schema, this);
  }
}

const payload = new Payload(toAddress, toAmount);
const serializedData = payload.serialize();
const ixIndex = Uint8Array.of(0)
const dataArray = new Uint8Array(ixIndex.length + serializedData.length)
dataArray.set(ixIndex);
dataArray.set(serializedData, ixIndex.length);

console.log({ serializedData })

const length = serializedData.slice(0, 4);
console.log({ length });


async function multisend() {
  
  let ins = new TransactionInstruction({
    keys: keyArray,
    programId: programId,
    data: Buffer.from(dataArray)
  })

  let balance = await connection.getBalance(signer.publicKey);
  console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

  const tx = new Transaction().add(ins)
  await connection.sendTransaction(tx, [signer], {skipPreflight: false, preflightCommitment: 'singleGossip'})

  console.log(`${balance / LAMPORTS_PER_SOL} SOL`);
  
}

// multisend()






