---
id: weapons-grade-metaprotocols
title: Weapons Grade Metaprotocols on METASHREW
sidebar_label: Weapons Grade Metaprotocols
---

# Weapons-grade Metaprotocols on METASHREW

For those who have attempted to extend Bitcoin via the metaprotocol layer, or even just write software to index metaprotocols such as ordinals or BRC-20, you may be aware of the scope of the problem. Most traditional metaprotocols we've seen are easy enough to understand a schema for, as far as the rules to process a single block to update the state of an index.

For ordinals, parsing a block to track the owner of an inscription by a given sequence number, may require program flow such as:

- Process each transaction, and if there is a witness stack with an ord-prefixed inscription structure, assign a sequence number and insert into the database
- Compute ranges of sats as they are spent onto new outputs, removing their original positions in the set of spendable UTXOs paid into the transaction, and assigning partition ranges instead to UTXOs which are created
- Associate sequence numbers for updated owners to their new computed address, based on UTXOs which are able to spend inscriptions associated with a given number

The scope of the ord indexer is greater than this, but this is perhaps one example of a means to design a program which can, when queried, provide a user interface with data about ownership for a given inscription.

These rules are simple enough, but there is much more you have to deal with if you are writing an indexer program.

Some of this work includes:

- Retrieving block data from a desired start block height and replaying until the block tip
- At tip, wait for new blocks to appear, and when they do, process indexer rules for the new block and update the database
- Maintain database connections and implement any query language needed to work against your data store
- Detect a reorg and, if needed, roll back state of the index
- Provide an API to read from the indexer and render as JSON or any desired format
- Retrieve historical state of the index, if we want a view into the dataset at an earlier state
- If needed, compute integrity checks of the dataset to ensure there is no corruption and that the state of the index is consistent with others running the same program, without explicitly rebuilding the index from the beginning. Sometimes this is accomplished with merklized tree structures, for example

There is more that one may want to do, but these are some examples of problems that would have to be solved for anyone attempting to index a metaprotocol with software built from scratch.

## METASHREW

The METASHREW framework is designed to simplify the task of implementing a metaprotocol, and makes it possible to architect a metaprotocol as intensive as ALKANES. When you build a metaprotocol on METASHREW, instead of building an indexer from scratch, you strictly build a single WASM program, written in any language that is an LLVM frontend, such as Rust.

METASHREW can load a WASM program built with metashrew bindings and run it once for each block in series, automatically detecting reorgs, rolling back state, and processing the corrected block history to correct the state of the index. We choose WASM because it is a portable format for a binary which is platform-independent, where we can deterministically compile the same WASM file to run with identical behavior, with matching compiler software and a version of the source code for the indexer.

With a METASHREW program, it is possible to verify the complete index by simply hashing or otherwise computing a checksum of the WASM program expressing the index, then comparing it to a known value. The same WASM file against the same blockdata will produce the same index in the backend database.

A METASHREW program simply handles the processing of a single block as it seen during a sync of block history from the desired start height. The program is provided a handle to an arbitrary k/v store provided by the runtime. For normal usage of METASHREW we encourage the use of metashrew-keydb provided in the repository, which uses the KeyDB database engineered by the Snapchat team. This database allows us to perform I/O from the indexer directly over a UNIX socket, and it will allow us to do the majority of our work entirely in-memory, if we have a system with a large amount of resources available. This helps with METASHREW programs since we attempt to reuse a local cache of the k/v pairs we store with each block, to avoid context switching out of the WASM program to its most minimal frequency while we rapidly build an index.

METASHREW provides an RPC layer which is designed to be parallelized. View functions are just normal exports from a WASM program, which use the same runtime functions within the indexer environment to access inputs provided with the RPC call.

In ALKANES, we provide a view function to simulate an arbitrary transaction with any mocked inputs of value or cellpack we provide. It is technically possible to execute sandboxed WASM directly within this view function if a contract deployment is simulated against this view function. In this way, a potentially complex view of ALKANES state can be constructed with a view function call, and if the RPC layer is properly multiprocessed on the systems providing metashrew-view service running the alkanes.wasm, we can horizontally scale the rendering model of a user application. This makes it possible, for example, to render graphics or assemble/transform PNG or SVG images, to build more immersive NFTs. In fact, the alkanes-rs repository ships a minimal example of an NFT on ordinals, which we have coined orbitals.

Below is the source code for the most minimal implementation of an orbital:

```rust
use alkanes_runtime::{runtime::AlkaneResponder, storage::StoragePointer, token::Token};
use alkanes_support::{parcel::AlkaneTransfer, response::CallResponse, utils::shift};
use anyhow::{anyhow, Result};
use hex_lit::hex;
use metashrew_support::compat::{to_arraybuffer_layout, to_passback_ptr};
use metashrew_support::index_pointer::KeyValuePointer;

#[derive(Default)]
pub struct Orbital(());

impl Token for Orbital {
    fn name(&self) -> String {
        String::from("1x1 Ape (Very f** rare)")
    }
    fn symbol(&self) -> String {
        String::from("APE")
    }
}

impl Orbital {
    pub fn total_supply_pointer(&self) -> StoragePointer {
        StoragePointer::from_keyword("/totalsupply")
    }
    pub fn total_supply(&self) -> u128 {
        self.total_supply_pointer().get_value::<u128>()
    }
    pub fn set_total_supply(&self, v: u128) {
        self.total_supply_pointer().set_value::<u128>(v);
    }
    pub fn observe_initialization(&self) -> Result<()> {
        let mut initialized_pointer = StoragePointer::from_keyword("/initialized");
        if initialized_pointer.get().len() == 0 {
            initialized_pointer.set_value::<u32>(1);
            Ok(())
        } else {
            Err(anyhow!("already initialized"))
        }
    }
    pub fn data(&self) -> Vec<u8> {
        // in this reference implementation, we return a 1x1 PNG
        // NFT data can be anything, however, and it can be computed, if we want a dynamic effect
        (&hex!("89504e470d0a1a0a0000000d494844520000000100000001010300000025db56ca00000003504c5445000000a77a3dda0000000174524e530040e6d8660000000a4944415408d76360000000020001e221bc330000000049454e44ae426082")).to_vec()
    }
}

impl AlkaneResponder for Orbital {
    fn execute(&self) -> CallResponse {
        let context = self.context().unwrap();
        let mut inputs = context.inputs.clone();
        let mut response = CallResponse::forward(&context.incoming_alkanes);
        match shift(&mut inputs).unwrap() {
            0 => {
                self.observe_initialization().unwrap();
                self.set_total_supply(1);
                response.alkanes.0.push(AlkaneTransfer {
                    id: context.myself.clone(),
                    value: 1u128,
                });
            }
            99 => {
                response.data = self.name().into_bytes().to_vec();
            }
            100 => {
                response.data = self.symbol().into_bytes().to_vec();
            }
            101 => {
                response.data = (&self.total_supply().to_le_bytes()).to_vec();
            }
            1000 => response.data = self.data(),
            _ => {
                panic!("unrecognized opcode");
            }
        }
        response
    }
}

#[no_mangle]
pub extern "C" fn __execute() -> i32 {
    let mut response = to_arraybuffer_layout(&Orbital::default().run());
    to_passback_ptr(&mut response)
}
```

Source: https://github.com/kungfuflex/alkanes-rs/tree/main/crates/alkanes-std-orbital/src/lib.rs

We reserve opcode 1000 for the data view function, which in this case returns a static bytearray, but could in theory be used to pack or construct any dynamic bytearray or imagedata blob, since the view function to simulate transaction messages in ALKANES is run with a very large fuel limit and capable of long running compute.

The METASHREW architecture provides a means to run this kind of compute in an entirely separate process or container, since the data is decoupled from the indexer, and the indexer is decoupled from the view layer.

## Compatibility

METASHREW was initially designed as an electrum fork, but I since rewrote it from scratch in order to design an indexer routine that purely operates over the RPC port, to make it more universal for use against Bitcoin compatible interfaces other than Bitcoin itself, including DOGE or DOGE forks.

The libraries for METASHREW are now most up to date as they appear in the Rust monorepo for alkanes-rs, including the pure bindings to METASHREW and also metashrew-support which is an environment-agnostic support library for lower level operations frequently done both in the ALKANES indexer as well as alkane smart contracts themselves.

This includes my own AuxpowBlock structure and implementation, which provides a replacement for the usual rust-bitcoin library, one that can properly parse merge mined blockchains with a slightly modified structure, and requires an extension to the usual Bitcoin block parsing logic.

The implementation of AuxpowBlock provides a convenience method to convert back into a bitcoin::Block structure which drops the Auxpow metadata if we do not need it for our indexer. To index ALKANES, we do not use it.

The result is that the pure Rust implementation of ALKANES, and any other metaprotocol forked from it or built on METASHREW with the support libraries we provide, can run on Bitcoin mainnet, or the many forks we have seen gain some traction in the wild such as Luckycoin, Bellscoin.

And yes, this means we also will have a genesis block for our DOGE L1 smart contracts as well. These genesis constants will likely change as they currently appear in the build system but we will see a canonical ALKANES appear on DOGE L1 on protorunes subprotocol ID 1, sometime following release on mainnet Bitcoin.

I will explain in a future post about why this is a good thing.
