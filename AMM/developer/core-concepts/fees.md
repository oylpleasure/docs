---
sidebar_position: 3
---

# Fees

The Oyl AMM protocol implements a fee structure that incentivizes liquidity provision while maintaining competitive trading costs.

## Fee Structure
Total **0.5%** fee for swaps
### Trading Fees
- **0.3%** fee on all swaps
- Automatically added to pool reserves
- Distributed proportionally to liquidity providers

### Protocol Fees
- **0.2%** fee on all swaps


## How Fees Work

### Fee Distribution
Trading fees are distributed through the pool mechanism:
1. Fees are added to the pool's reserves
2. This increases the value of LP tokens
3. Liquidity providers benefit when they withdraw

### Compound Growth
Fees automatically compound:
- Fees increase pool reserves
- Larger reserves generate more fees
- Creates positive feedback loop for liquidity providers

## Fee Accrual

### Real-time Accrual
Fees accrue with every swap:
- No need to claim fees separately
- Fees are reflected in LP token value
- Automatic compounding maximizes returns

### LP Token Value Growth
As fees accumulate:
```
LP_token_value = (reserve_A + reserve_B) / total_LP_supply
```

The value of LP tokens increases as reserves grow from fees.

## Fee Collection

### For Liquidity Providers
Liquidity providers collect fees by removing liquidity from the pool

### Protocol Fee Collection
The factory contract includes a fee collection mechanism:
```rust
#[opcode(10)]
CollectFees { pool_id: AlkaneId }
```

This allows authorized parties to collect any protocol fees.

## Fee Economics

### Liquidity Provider Returns
LP returns come from:
- **Trading fees**: 0.3% of all swap volume
- **Token appreciation**: If underlying tokens appreciate
- **Impermanent loss**: Risk of loss due to price divergence

### Expected Returns
LP returns depend on:
- **Trading volume**: Higher volume = more fees
- **Pool size**: Smaller pools may have higher fee yields
- **Market volatility**: Affects both fees and impermanent loss

The fee structure in Oyl AMM is designed to be simple, fair, and sustainable, providing strong incentives for liquidity provision while maintaining competitive trading costs.