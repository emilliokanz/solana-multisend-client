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
import * as borsh from "borsh";
import {Buffer} from "buffer";

const devnet = clusterApiUrl("devnet");
const privateConnection = "http://127.0.0.1:8899";
const connection = new Connection(privateConnection, "confirmed");
let toAddress: any = [];


class Payload {
    transactions!: [{
      address: PublicKey;
      amount: number;
    }];
    constructor(transactions: [{
      address: PublicKey;
      amount: number;
    }]){
      this.transactions = transactions;
   }
  }

  const schema = new Map ([
    [
      Payload,
      {
        kind: "struct",
        fields: [
          ["transactions", "[{address: PublicKey, amount: number}]"]
        ]
      }
    ]
  ])


// FOR SIMULATION (receive from pubkey from body)
const signer =  Keypair.fromSecretKey(Uint8Array.from([31,76,102,45,230,167,90,81,188,205,133,162,8,180,157,5,196,145,153,138,175,252,199,30,87,84,41,123,131,105,127,50,174,90,139,71,123,211,49,188,149,93,220,97,44,8,241,44,82,231,185,227,150,51,74,162,213,40,69,203,239,227,16,193]));
const fromPubkey: any = signer.publicKey;
let programId = new PublicKey("7eURhSmceJNVn2krxxX3NgqkBUtH5Bz3DAS4qs4M2DY3");

// FOR SIMULATION (generating accounts and amounts into array)
for(let i=0;i<=8;i++) {
   toAddress.push({
    address: Keypair.generate().publicKey,
    amount: i
   })
}
console.log(toAddress)

const datas = new Payload(toAddress)

let keyArray = [
  {pubkey: fromPubkey, isSigner: true, isWritable: true},
  {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
]

// toAddress.map((data) => {
//   keyArray.push({pubkey: data, isSigner: false, isWritable: true})
// })
// console.log(keyArray);

async function multisend(from: Keypair, to: Array<AccountMeta>, amount: number[]) {
  await connection.requestAirdrop(fromPubkey, LAMPORTS_PER_SOL * 1);
  let ins = new TransactionInstruction({
    keys: keyArray,
    programId: programId,
    data: Buffer.from(borsh.serialize(schema, datas))
  })

  let balance = await connection.getBalance(signer.publicKey);
  console.log(`${balance / LAMPORTS_PER_SOL} SOL`);

  const tx = new Transaction().add(ins)
  await connection.sendTransaction(tx, [signer], {skipPreflight: false, preflightCommitment: 'singleGossip'})
}

multisend(fromPubkey, keyArray, [1])





// interface SendInstructionInterface {
//   address: PublicKey;
//   amount: number;
// }
// interface SendDataInterface {
//   transactions: SendInstructions[];
// }
// class SendInstructions implements SendInstructionInterface {
//    address!: PublicKey;
//    amount!: number;

//    constructor(address: PublicKey, amount: number){
//       this.address = address;
//       this.amount = amount;
//    }
// }
// class SendDatas implements SendDataInterface {
//   transactions!: SendInstructions[];
//   constructor(transactions: SendInstructions[]){
//     this.transactions = transactions;
//  }
// }

// const SendInstructionsSchema = new Map ([
//   [SendDatas, {
//     kind: 'struct',
//     fields: [
//       ['transactions', [SendInstructions]],
//     ]
//   }],
// ])






// (async () => {

//   const connection = new Connection("http://127.0.0.1:8899", "confirmed");

//   const fromPubkey: any = Keypair.generate().publicKey;

//   const toData: any[] = [];
  
//   for(let i=0;i<=10;i++) {
//     toData.push([Keypair.generate().publicKey, i])
//   }
//   console.log(toData)

//   const initMultisendIx = new TransactionInstruction({
//     programId:  ,
//     // for keys, loop array of body
//     keys: [],
//     data: Buffer.from(Uint8Array.of(0, ...new BN(expectedAmount).toArray("le", 8))
//   });

//   const tx = new Transaction(initMultisendIx)

//   await connection.sendTransaction(tx,fromPubkey)

// })();




