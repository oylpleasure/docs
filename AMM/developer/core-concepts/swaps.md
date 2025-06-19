---
sidebar_position: 2
---

# Swaps

Swaps are the core trading mechanism in the Oyl AMM protocol. They allow users to exchange one token for another using the liquidity stored in pools.

## How Swaps Work

### Constant Product Formula
Swaps in Oyl AMM follow the constant product formula:
```
x * y = k
```

When a user swaps token A for token B:
1. Token A is added to the pool's reserve
2. Token B is removed from the pool's reserve
3. The product `k` remains constant (minus fees)
4. Price adjusts based on the new reserve ratio

### Price Impact
The price impact of a swap depends on:
- **Trade size**: Larger trades have higher price impact
- **Pool liquidity**: More liquidity means lower price impact
- **Current reserves**: Imbalanced pools have higher impact

## Swap Types

### Exact Input Swaps
User specifies exact amount of input tokens:
```rust
SwapExactTokensForTokens {
    path: Vec<AlkaneId>,        // Token path for the swap
    amount_out_min: u128,       // Minimum output amount
    deadline: u128,             // Transaction deadline
}
```

### Exact Output Swaps
User specifies exact amount of output tokens:
```rust
SwapTokensForExactTokens {
    path: Vec<AlkaneId>,        // Token path for the swap
    amount_out: u128,           // Exact output amount desired
    amount_in_max: u128,        // Maximum input amount
    deadline: u128,             // Transaction deadline
}
```

## Multi-hop Swaps

### Path Routing
For tokens without direct pairs, swaps can route through multiple pools:
```
Token A → Token B → Token C
```

The `path` parameter defines the route:
- First element: input token
- Last element: output token
- Intermediate elements: routing tokens

## Swap Calculations

### Output Amount Calculation
For exact input swaps:
```rust
fn get_amount_out(amount_in: u128, reserve_in: u128, reserve_out: u128) -> u128 {
    let amount_in_with_fee = amount_in * 997; // 0.3% fee
    let numerator = amount_in_with_fee * reserve_out;
    let denominator = (reserve_in * 1000) + amount_in_with_fee;
    numerator / denominator
}
```

### Input Amount Calculation
For exact output swaps:
```rust
fn get_amount_in(amount_out: u128, reserve_in: u128, reserve_out: u128) -> u128 {
    let numerator = reserve_in * amount_out * 1000;
    let denominator = (reserve_out - amount_out) * 997;
    (numerator / denominator) + 1
}
```

## Slippage Protection

### Minimum Output
For exact input swaps, specify minimum output:
```rust
amount_out_min: u128  // Revert if output is less than this
```

### Maximum Input
For exact output swaps, specify maximum input:
```rust
amount_in_max: u128   // Revert if input exceeds this
```

### Deadline Protection
All swaps include deadline protection:
```rust
deadline: u128        // Revert if block timestamp exceeds this
```

## Low-Level Swap Function

### Direct Pool Swap
Advanced users can call the pool's swap function directly:
```rust
Swap {
    amount_0_out: u128,     // Amount of token0 to receive
    amount_1_out: u128,     // Amount of token1 to receive
    to: AlkaneId,           // Recipient address
    data: Vec<u128>,        // Additional data for flash swaps
}
```

**Warning**: Direct swaps bypass safety checks and should only be used by experienced developers.

## Flash Swaps

### Concept
Flash swaps allow borrowing tokens from a pool without upfront payment:
1. Receive tokens from the pool
2. Use tokens in external operations
3. Repay the pool (with fee) in the same transaction

### Use Cases
- Arbitrage opportunities
- Liquidations
- Complex trading strategies


## Best Practices

### Slippage Management
- Calculate expected output off-chain
- Set appropriate slippage tolerance
- Consider market volatility

### Deadline Setting
- Use reasonable deadlines (~30 minutes)
- Account for network congestion
- Avoid very short deadlines

### Route Selection
- Check multiple paths for best rates
- Consider fuel costs for multi-hop swaps
- Monitor pool liquidity

Swaps are the primary way users interact with the Oyl AMM protocol, providing efficient and decentralized token exchange.