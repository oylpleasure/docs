---
sidebar_position: 4
---

# Oracles

The Oyl AMM protocol includes built-in price oracle functionality that provides time-weighted average prices (TWAP) for all trading pairs. It follows the same formulas as the UniswapV2 Oracle.

## Price Oracle Overview

### What are Price Oracles?
Price oracles provide external price data that can be used by other smart contracts. The Oyl AMM includes native oracle functionality that:
- Tracks cumulative prices over time
- Enables calculation of time-weighted average prices
- Provides manipulation-resistant price feeds

### Oracle Security
The oracle system is designed to be:
- **Manipulation resistant**: Requires sustained price manipulation to affect TWAP
- **Decentralized**: No single point of failure
- **Always available**: Updates with every swap

## How Oracles Work

### Price Accumulation
The protocol tracks cumulative prices:
```rust
#[opcode(98)]
#[returns(u128, u128)]
GetPriceCumulativeLast
```

This returns the cumulative price for both tokens in the pair.

### Price Calculation
Current price is calculated as:
```rust
let price_0 = reserve_1 / reserve_0;  // Price of token0 in token1
let price_1 = reserve_0 / reserve_1;  // Price of token1 in token0
```

### Time-Weighted Average Price (TWAP)
TWAP is calculated over a time period:
```rust
let twap = (price_cumulative_end - price_cumulative_start) / time_elapsed;
```

## Oracle Implementation

### Price Accumulation Logic
Prices are accumulated on every swap:
1. Calculate current price
2. Multiply by time elapsed since last update
3. Add to cumulative price
4. Store new cumulative price and timestamp

### Precision Handling
The oracle uses high-precision arithmetic:
- Prices are stored as fixed-point numbers, with 128 bits of decimals and 128 bits of integer
- Prevents precision loss over time
- Handles extreme price ratios

## Using Price Oracles

### Reading Current Price
Get the current spot price:
```rust
let current_price = reserve_1 / reserve_0;
```

### Calculating TWAP
To calculate TWAP over a period:
```rust
// Get price cumulatives at two different times
let (cumulative_start, timestamp_start) = get_price_cumulative_at(start_time);
let (cumulative_end, timestamp_end) = get_price_cumulative_at(end_time);

// Calculate TWAP
let time_elapsed = timestamp_end - timestamp_start;
let twap = (cumulative_end - cumulative_start) / time_elapsed;
```

### Converting to Integer and Decimal
The TWAP price returned has 128 bits for decimal and 128 bits for the integer:
```rust
pub const PRECISION: u32 = 128;

let data: Vec<u8> = // GetPriceCumulativeLast
let p0: U256 = StorableU256::from_bytes(data[0..32].to_vec()).into();
let integer = p0 >> U256::from(PRECISION);
let decimal = p0 & U256::from(u128::MAX);
```

## Oracle Use Cases

### DeFi Applications
Price oracles enable:
- **Lending protocols**: Collateral valuation
- **Derivatives**: Settlement prices
- **Yield farming**: Reward calculations
- **Portfolio management**: Asset valuation

### Risk Management
Oracles help with:
- **Liquidation systems**: Trigger liquidations
- **Stop-loss orders**: Automated trading
- **Risk assessment**: Portfolio risk metrics

## Oracle Best Practices

### TWAP Period Selection
Choose appropriate time windows:
- **Short periods** (5-15 minutes): More responsive but less manipulation resistant
- **Long periods** (1-24 hours): More manipulation resistant but less responsive
- **Multiple periods**: Use different windows for different purposes

### Manipulation Resistance
Protect against manipulation:
- Use longer TWAP periods for critical operations
- Combine multiple oracle sources
- Implement circuit breakers for extreme price movements

### Update Frequency
Consider oracle update patterns:
- Oracles update with every swap
- Low-volume pairs may have stale prices
- Monitor last update timestamp

## Oracle Limitations

### Low Liquidity Pairs
Oracles for low-liquidity pairs may be:
- More susceptible to manipulation
- Less frequently updated
- Less reliable for critical operations

### Extreme Market Conditions
During extreme volatility:
- TWAP may lag current prices significantly
- Consider using shorter periods or spot prices
- Implement additional safety mechanisms

## Integration Examples

### Simple Price Query
```rust
// Get current reserves and calculate price
let (reserve_a, reserve_b) = pool.call(AMMPoolMessage::GetReserves)?;
let price = reserve_b * PRECISION / reserve_a;
```

### TWAP Calculation
```rust
// Calculate 1-hour TWAP
let current_time = get_current_timestamp();
let hour_ago = current_time - 3600;

let (cumulative_now, _) = pool.call(AMMPoolMessage::GetPriceCumulativeLast)?;
let (cumulative_hour_ago, _) = get_historical_cumulative(hour_ago);

let twap = (cumulative_now - cumulative_hour_ago) / 3600;
```

## Oracle Governance

### Parameter Updates
Oracle parameters that may be governable:
- Minimum time between updates
- Precision parameters
- Emergency pause mechanisms

### Quality Assurance
Ensure oracle quality through:
- Regular monitoring
- Comparison with external sources
- Community oversight

## Future Enhancements

### Advanced Oracle Features
Potential future improvements:
- **Volume-weighted prices**: Weight by trading volume
- **Multiple timeframe support**: Built-in TWAP calculations
- **Cross-chain oracles**: Price feeds across different chains

### Oracle Aggregation
Future versions might include:
- Multiple oracle source aggregation
- Outlier detection and filtering
- Confidence intervals for price data

The oracle system in Oyl AMM provides reliable, manipulation-resistant price data that forms the foundation for many DeFi applications and risk management systems.