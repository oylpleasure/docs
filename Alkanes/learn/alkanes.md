---
sidebar_position: 2
title: Alkanes Contracts
---

# What are Alkanes Contracts?

Alkanes contracts are smart contracts that run on Bitcoin, enabling programmable functionality similar to what Ethereum smart contracts provide. They allow developers to create decentralized applications (dApps) directly on Bitcoin's L1 blockchain, without requiring additional layers or sidechains.

Key features of Alkanes contracts include:

- **Native Bitcoin Integration**: Contracts interact directly with Bitcoin transactions and UTXOs
- **State Management**: Maintain contract state between interactions
- **Composability**: Contracts can interact with each other

An Alkanes contract typically consists of:

1. **State Storage**: Key-value storage for maintaining contract data
2. **Opcodes**: Numbered functions that define contract actions
3. **Response Handling**: Logic for returning data and managing assets
4. **Asset Management**: Capabilities for handling Bitcoin and Alkanes tokens

Similar to other smart contract L1s, Alkanes contracts provide a flexible programming model for implementing decentralized applications. Developers can encode arbitrary business logic and computation. This means contracts can implement complex financial instruments, governance systems, games, or any other programmable interaction. The EVM provides a consistent execution environment where code behavior is deterministic and state changes are atomic.

Contracts can store complex data structures and maintain state across transactions. This allows for intuitive modeling of concepts like account balances, voting weights, or accumulated interest. In addition, contract-to-contract interactions and composability are first-class features. Thus, contracts can call other contracts, transfer assets between them, and build on existing protocols, enabling the creation of sophisticated DeFi primitives that can be combined: lending protocols can integrate with AMMs, which can be used by yield aggregators, which can be deposited into governance systems, and so on.

## Alkanes Tokens

Alkanes token contracts are a standardized implementation pattern that represent fungible tokens - digital assets where each unit is identical and interchangeable.

At their core, Alkanes token contracts maintain a mapping of addresses to a balance sheet, tracking token ownership through key-value state storage. The critical operations are transfers (moving tokens between addresses) and approvals (allowing another address, often a contract, to transfer tokens on your behalf).

State management typically involves two key mappings: *balances* tracking how many tokens each address owns, and *allowances* tracking approved spending permissions between addresses. When tokens are transferred, these mappings are atomically updated, ensuring invariants like "total supply equals sum of all balances" are maintained.

The approval mechanism is particularly important for composability - it enables tokens to be seamlessly integrated with other smart contracts like AMMs, lending markets, or other DeFi protocols. A user can approve a DEX contract to spend their tokens, then that contract can execute trades by transferring those tokens in response to function calls.

But, Alkanes token implementations extend beyond the basic standard to add features like:

- Minting and burning capabilities (often with access controls)
- Token metadata (name, symbol, decimals)
- Transfer hooks for additional logic
- Supply caps or other monetary policy
- Snapshot functionality for governance

This combination of standardized interfaces and extensible implementation patterns enables everything from stablecoins to governance tokens to wrapped assets.

## Alkanes Factory Contracts

Alkanes factory contracts are a design pattern that enables programmatic cloning of a base contract. For example, you may want to deploy a single factory contract that defines the logic for token minting and distribution and then use clones of that contract to create individual tokens that inherit that logic. 

A factory contract is essentially a smart contract that contains the bytecode and deployment logic for creating new Alkanes token contracts. Rather than directly deploying each token contract, users interact with the factory, which handles the creation process. The factory uses Alkanes's FACTORYRESERVED opcode to deploy new contract instances, typically taking parameters like token name, symbol, total supply, and mint parameters.

Using FACTORYRESERVED, factories can generate deterministic Alkane IDs (block and transaction index) for new tokens based on initialization parameters, enabling consistent implementation patterns, security features, and upgrade paths across all tokens they create.

Advanced factory patterns may include:

- Registry functionality to track deployed tokens
- Template systems for different token variants
- Access controls for token deployment
- Initialization hooks for setting up token parameters
- Integration with governance or permission systems
- Fee mechanisms for token creation

In DeFi protocols, factories are commonly used to deploy pairs of tokens for AMMs, create wrapped asset tokens, or mint governance tokens for new projects. They provide a standardized, gas-efficient way to programmatically expand token ecosystems while maintaining consistent security and implementation patterns.
