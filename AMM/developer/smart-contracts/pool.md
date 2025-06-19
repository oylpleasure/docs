---
sidebar_position: 2
---

# Pool Contract

Pool contracts are the core trading venues in the Oyl AMM protocol. Each pool represents a single trading pair and contains the reserves, trading logic, and liquidity management for that pair.

## Contract Overview

Each Pool contract:
- **Holds Reserves**: Stores tokens for the trading pair
- **Executes Swaps**: Implements the constant product formula
- **Manages Liquidity**: Mints and burns LP tokens
- **Tracks Prices**: Maintains price oracles
- **Collects Fees**: Accumulates trading fees for liquidity providers

## Core Functions

### Pool Initialization

#### InitPool
Initializes a new pool with the trading pair:
```rust
#[opcode(0)]
InitPool {
    alkane_a: AlkaneId,         // First token in the pair
    alkane_b: AlkaneId,         // Second token in the pair
    factory: AlkaneId,          // Factory contract address
}
```

This function:
- Sets up the token pair
- Links to the factory contract
- Initializes reserves to zero
- Prepares the pool for liquidity provision

### Liquidity Management

#### AddLiquidity
Adds liquidity to the pool:
```rust
#[opcode(1)]
AddLiquidity
```

This function:
1. Receives tokens from the user
2. Calculates LP tokens to mint
3. Updates pool reserves
4. Mints LP tokens to the user
5. Updates price oracles

#### Burn
Removes liquidity from the pool:
```rust
#[opcode(2)]
Burn
```

This function:
1. Burns user's LP tokens
2. Calculates proportional token amounts
3. Transfers tokens to the user
4. Updates pool reserves
5. Updates price oracles

### Trading

#### Swap
Executes a token swap:
```rust
#[opcode(3)]
Swap {
    amount_0_out: u128,         // Amount of token0 to send out
    amount_1_out: u128,         // Amount of token1 to send out
    to: AlkaneId,               // Recipient address
    data: Vec<u128>,            // Additional data (for flash swaps)
}
```

**Warning**: This is a low-level function that should generally not be called directly. Use the Factory contract's swap functions instead.

The swap function:
1. Validates the swap parameters
2. Transfers tokens to the recipient
3. Calls back if data is provided (flash swap)
4. Validates the constant product formula
5. Updates reserves and price oracles

### Information Queries

#### GetReserves
Returns the current token reserves:
```rust
#[opcode(97)]
#[returns(u128, u128)]
GetReserves
```

Returns `(reserve0, reserve1)` where:
- `reserve0`: Amount of token0 in the pool
- `reserve1`: Amount of token1 in the pool

#### GetPriceCumulativeLast
Returns cumulative prices for oracle functionality:
```rust
#[opcode(98)]
#[returns(u128, u128)]
GetPriceCumulativeLast
```

Returns cumulative prices used for TWAP calculations.

#### GetName
Returns the pool's name:
```rust
#[opcode(99)]
#[returns(String)]
GetName
```

#### PoolDetails
Returns comprehensive pool information:
```rust
#[opcode(999)]
#[returns(Vec<u8>)]
PoolDetails
```

### Fee Management

#### CollectFees
Collects accumulated fees:
```rust
#[opcode(10)]
CollectFees {}
```

This function allows authorized parties to collect protocol fees from the pool.

### Utility Functions

#### ForwardIncoming
Handles incoming token transfers:
```rust
#[opcode(50)]
ForwardIncoming
```

This function processes incoming tokens and updates internal accounting.

## Pool States

### Empty Pool
- No liquidity provided
- Reserves are zero
- Cannot execute swaps
- Waiting for initial liquidity

### Active Pool
- Has liquidity from providers
- Can execute swaps
- Generates fees
- Price oracles are active

### Imbalanced Pool
- Significant price deviation from external markets
- Arbitrage opportunities available
- Higher price impact for trades

## Liquidity Provider Tokens

### LP Token Mechanics
LP tokens represent ownership in the pool:
```rust
LP_tokens = sqrt(amount0 * amount1)  // For first liquidity provision
LP_tokens = min(amount0 * total_supply / reserve0, amount1 * total_supply / reserve1)  // For subsequent provisions
```

### LP Token Value
The value of LP tokens increases over time due to fees:
```rust
token0_per_LP = reserve0 / total_LP_supply
token1_per_LP = reserve1 / total_LP_supply
```

## Price Oracle Integration

### Price Tracking
The pool automatically tracks:
- Current spot prices
- Cumulative prices over time
- Last update timestamp

### Oracle Updates
Price oracles update on every:
- Swap transaction
- Liquidity addition
- Liquidity removal

## Flash Swaps

### Concept
Flash swaps allow borrowing tokens without upfront payment:
1. Receive tokens from the pool
2. Use tokens in external operations
3. Repay the pool in the same transaction

### Implementation
```rust
// Flash swap with callback
pool.call(AMMPoolMessage::Swap {
    amount_0_out: borrow_amount,
    amount_1_out: 0,
    to: callback_contract,
    data: callback_data,  // Non-empty data triggers callback
})?;
```

### Callback Requirements
The callback contract must:
- Implement the flash swap callback interface
- Repay the borrowed amount plus fees
- Complete all operations in the same transaction

## Security Features

### Reentrancy Protection
- State changes occur before external calls
- Critical sections are protected
- Prevents reentrancy attacks

### Mathematical Safety
- Safe arithmetic prevents overflow/underflow
- Minimum liquidity prevents division by zero
- Invariant checks ensure pool integrity

### Access Control
- Critical functions require proper authorization
- User operations validate ownership
- Admin functions are restricted

## Integration Examples

### Checking Pool Reserves
```rust
let (reserve0, reserve1) = pool.call(AMMPoolMessage::GetReserves)?;
println!("Pool has {} token0 and {} token1", reserve0, reserve1);
```

### Direct Swap (Advanced)
```rust
// WARNING: Only for experienced developers
pool.call(AMMPoolMessage::Swap {
    amount_0_out: 0,
    amount_1_out: output_amount,
    to: recipient,
    data: vec![], // Empty data for regular swap
})?;
```

### Flash Swap Example
```rust
// Borrow tokens for arbitrage
pool.call(AMMPoolMessage::Swap {
    amount_0_out: borrow_amount,
    amount_1_out: 0,
    to: arbitrage_contract,
    data: vec![1], // Non-empty data triggers callback
})?;
```

## Best Practices

### For Regular Users
- Use Factory contract functions instead of direct pool calls
- Always set appropriate slippage protection
- Monitor pool reserves before large trades

### For Advanced Developers
- Understand the constant product formula
- Implement proper callback handling for flash swaps
- Test thoroughly on testnet before mainnet deployment

### For Integrators
- Monitor pool health and liquidity
- Implement circuit breakers for extreme conditions
- Use multiple pools for large trades when possible

Pool contracts are the heart of the Oyl AMM protocol, implementing the core trading and liquidity management functionality that enables decentralized exchange.