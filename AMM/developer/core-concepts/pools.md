---
sidebar_position: 1
---

# Pools

Pools are the fundamental building blocks of the Oyl AMM protocol. Each pool represents a trading pair between two tokens and contains reserves of both tokens that facilitate automated trading.

## What is a Pool?

A pool is a smart contract that holds reserves of two tokens and enables trading between them using an automated market maker (AMM) algorithm. Users can trade against the pool's reserves, and the pool automatically adjusts prices based on supply and demand.

## Constant Product Formula

Oyl AMM uses the constant product formula popularized by Uniswap:

```
x * y = k
```

Where:
- `x` = reserve of token A
- `y` = reserve of token B  
- `k` = constant product (invariant)

This formula ensures that the product of the reserves remains constant after each trade, automatically adjusting prices based on the ratio of reserves.

## Pool Creation

### Automatic Creation
Pools are created automatically when:
1. A user attempts to add liquidity to a non-existent pair
2. The Factory contract deploys a new Pool contract
3. Initial liquidity is provided to establish the pool

### Pool Initialization
When a pool is first created:
```rust
InitPool {
    alkane_a: AlkaneId,    // First token in the pair
    alkane_b: AlkaneId,    // Second token in the pair
    factory: AlkaneId,     // Factory contract address
}
```

## Pool Reserves

### Reserve Management
Each pool maintains reserves of both tokens:
- Reserves are updated after every swap or liquidity operation
- The `GetReserves` function returns current reserve amounts
- Reserves determine the current exchange rate

### Price Calculation
The price of token A in terms of token B is:
```
price_A = reserve_B / reserve_A
```

As trades occur, reserves change and prices adjust automatically.

## Liquidity Provision

### Adding Liquidity
Users can provide liquidity by depositing both tokens:
- Must deposit tokens in the current pool ratio
- Receives LP tokens representing their share
- Earns trading fees proportional to their share

### Removing Liquidity
Liquidity providers can withdraw by:
- Burning their LP tokens
- Receiving proportional amounts of both tokens
- Including any accumulated fees

## Pool Operations

### Core Functions

#### GetReserves
Returns the current reserves of both tokens:
```rust
#[opcode(97)]
#[returns(u128, u128)]
GetReserves
```

#### AddLiquidity
Adds liquidity to the pool:
```rust
#[opcode(1)]
AddLiquidity
```

#### Burn
Removes liquidity from the pool:
```rust
#[opcode(2)]
Burn
```

#### Swap
Executes a token swap:
```rust
#[opcode(3)]
Swap {
    amount_0_out: u128,
    amount_1_out: u128,
    to: AlkaneId,
    data: Vec<u128>,
}
```

## Fee Structure

### Trading Fees
- 0.5% fee on all swaps (similar to Uniswap V2)
- 0.3% LP fees, 0.2% protocol fees
- Automatically compound for liquidity providers

### Fee Distribution
- Fees are distributed proportionally to LP token holders
- Fees are realized when liquidity is removed

## Pool Security

### Minimum Liquidity
- Prevents division by zero errors
- Ensures pool stability
- Small amount locked permanently on first liquidity provision

### Price Impact Protection
- Large trades have higher price impact
- Slippage protection through minimum output amounts
- Front-running protection through deadlines

## Integration Examples

### Finding Pool Reserves
```rust
// Get current reserves for a pool
fn _get_reserves(&self, pool: AlkaneId) -> Result<(u128, u128)> {
    let cellpack = Cellpack {
        target: pool,
        inputs: vec![97],
    };
    let response = self.call(&cellpack, &AlkaneTransferParcel(vec![]), self.fuel())?;
    let mut offset = 0;

    let reserve_a = u128::from_le_bytes(response.data[offset..offset + 16].try_into()?);
    offset += 16;
    let reserve_b = u128::from_le_bytes(response.data[offset..offset + 16].try_into()?);

    Ok((reserve_a, reserve_b))
}
```

### Calculating Swap Output
```rust
// Calculate expected output for a given input
let amount_out = get_amount_out(amount_in, reserve_in, reserve_out);
```

Pools form the foundation of the Oyl AMM protocol, enabling decentralized trading through automated market making mechanisms.