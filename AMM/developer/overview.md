---
sidebar_position: 1
---

# Overview

The Oyl AMM is a decentralized exchange protocol built on Bitcoin using the Alkanes metaprotocol. It implements an automated market maker (AMM) system similar to Uniswap V2, enabling users to trade tokens and provide liquidity in a trustless manner.

## What is Oyl AMM?

Oyl AMM is a system of smart contracts that facilitates automated token trading on Bitcoin. The protocol consists of:

- **Factory Contract**: Creates and manages trading pairs
- **Pool Contracts**: Handle individual trading pairs and liquidity
- **Library Functions**: Provide mathematical calculations for trading

## Key Features

### Automated Market Making
- Constant product formula (x * y = k) for price discovery
- No order books - trades execute against liquidity pools
- Permissionless token listing

### Liquidity Provision
- Anyone can provide liquidity to earn fees
- LP tokens represent proportional ownership of pool reserves
- Fees are automatically reinvested into the pool

### Decentralized Trading
- No intermediaries or centralized control
- Trades settle on Bitcoin blockchain
- Transparent and auditable smart contracts

## Architecture

The Oyl AMM protocol is built using the Alkanes runtime, which enables smart contracts on Bitcoin. The system consists of three main components:

1. **Factory**: Manages pool creation and global settings
2. **Pools**: Individual trading pairs with their own reserves
3. **Library**: Mathematical functions for price calculations

## Getting Started

For developers looking to integrate with Oyl AMM:

1. Review the [Smart Contracts](./smart-contracts) documentation
2. Understand [Core Concepts](./core-concepts/pools) like pools and swaps
3. Follow our [Integration Guides](./guides/local-environment) to start building

## Protocol Benefits

- **Capital Efficiency**: Automated market making maximizes capital utilization
- **Permissionless**: Anyone can create pools or provide liquidity
- **Composable**: Smart contracts can be integrated into other protocols
- **Transparent**: All operations are recorded on the Bitcoin blockchain