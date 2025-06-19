----
id: terminal-usage
title: Terminal Usage Guide
sidebar_position: 2
---

# Terminal Usage Guide

This guide explains how to launch tokens and use Oyl Swap from the terminal.

## Prerequisites

Before you begin, make sure you have:

- A terminal or command-line interface
- Node.js and npm installed
- The Oyl CLI tools installed (`npm install -g @oyl/cli`)
- Access to the Oylnet testing environment

## Launching Tokens

You can create and launch your own tokens on Oylnet using the Oyl CLI.

### Token Creation

```bash
# Create a new token with basic parameters
oyl token create --name "MyToken" --symbol "MTK" --supply 1000000 --network oylnet

# Create a token with additional parameters
oyl token create --name "MyToken" --symbol "MTK" --supply 1000000 --decimals 18 --description "My test token on Oylnet" --network oylnet
```

### Token Deployment

After creating your token configuration, you can deploy it to Oylnet:

```bash
# Deploy the token to Oylnet
oyl token deploy --config my-token-config.json --network oylnet

# Verify your token deployment
oyl token info --address 0x123456789abcdef --network oylnet
```

## Using Oyl Swap from Terminal

Oyl Swap can be accessed and used directly from the terminal, which is useful for automated trading or testing.

### Setting Up

```bash
# Configure your Oyl Swap CLI
oyl swap setup --network oylnet --key YOUR_PRIVATE_KEY
```

### Checking Liquidity Pools

```bash
# List available liquidity pools
oyl swap pools --network oylnet

# Get detailed information about a specific pool
oyl swap pool-info --pool 0x123456789abcdef --network oylnet
```

### Performing Swaps

```bash
# Swap tokens using exact input amount
oyl swap exact-in --from-token 0xTokenA --to-token 0xTokenB --amount 10 --slippage 0.5 --network oylnet

# Swap tokens using exact output amount
oyl swap exact-out --from-token 0xTokenA --to-token 0xTokenB --amount 10 --slippage 0.5 --network oylnet
```

### Providing Liquidity

```bash
# Add liquidity to a pool
oyl swap add-liquidity --token-a 0xTokenA --token-b 0xTokenB --amount-a 10 --amount-b 20 --network oylnet

# Remove liquidity from a pool
oyl swap remove-liquidity --pool 0x123456789abcdef --amount 5 --network oylnet
```

## Batch Operations

For more complex operations, you can use batch scripts:

```bash
# Create a batch file (swap-operations.json)
{
  "operations": [
    {
      "type": "swap",
      "fromToken": "0xTokenA",
      "toToken": "0xTokenB",
      "amount": 10
    },
    {
      "type": "addLiquidity",
      "tokenA": "0xTokenB",
      "tokenB": "0xTokenC",
      "amountA": 5,
      "amountB": 15
    }
  ]
}

# Execute the batch operations
oyl swap batch --file swap-operations.json --network oylnet
```

## Monitoring and Debugging

```bash
# View transaction history
oyl swap history --network oylnet

# Check the status of a pending transaction
oyl swap tx-status --tx 0x123456789abcdef --network oylnet

# Debug a failed transaction
oyl swap debug --tx 0x123456789abcdef --network oylnet
```

## Advanced Usage

For advanced users, the Oyl CLI provides additional features:

```bash
# Create a liquidity pool for new tokens
oyl swap create-pool --token-a 0xTokenA --token-b 0xTokenB --fee 0.3 --network oylnet

# Set up automated trading strategies
oyl swap strategy --config my-strategy.json --network oylnet
```

Remember that all operations on Oylnet are for testing purposes only and do not involve real assets.
