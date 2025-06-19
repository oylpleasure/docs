---
sidebar_position: 2
---

# Flash Swap Development Guide

Flash swaps allow you to borrow tokens from a pool without upfront payment, execute arbitrary logic, and repay the loan (plus fees) in the same transaction. This guide shows how to develop flash swap contracts using the Oyl AMM protocol.

## Overview

Flash swaps enable powerful DeFi strategies:
- **Arbitrage**: Exploit price differences across exchanges
- **Liquidations**: Liquidate positions without holding collateral
- **Collateral Swapping**: Change collateral types atomically
- **Capital Efficiency**: Execute complex strategies without large capital

## Flash Swap Mechanics

### How Flash Swaps Work
1. **Borrow**: Request tokens from a pool with callback data
2. **Execute**: Perform arbitrary operations with borrowed tokens
3. **Callback**: Pool calls back to your contract
4. **Repay**: Return borrowed amount plus 0.3% fee
5. **Validation**: Pool verifies repayment and updates reserves

### The Callback Pattern
When you initiate a flash swap with non-empty data, the pool will:
1. Transfer tokens to your contract
2. Call your contract's callback function
3. Verify that the loan has been repaid
4. Update pool reserves

## Example Flash Swap Contract
TODO, link oyl flashswap example

Flash swaps are a powerful tool for building sophisticated DeFi strategies. Always test thoroughly and consider the security implications of your implementation.