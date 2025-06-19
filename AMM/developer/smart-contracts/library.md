---
sidebar_position: 3
---

# Library Functions

The Oyl AMM protocol includes a comprehensive library of mathematical functions and utilities that support trading calculations, price discovery, and liquidity management.

## Overview

The library provides:
- **Swap Mathematics**: Input/output amount calculations
- **Liquidity Math**: LP token calculations

## Core Mathematical Functions

### Swap Calculations

#### getAmountOut
Calculates output amount for a given input:
```rust
fn get_amount_out(
    amount_in: u128,
    reserve_in: u128,
    reserve_out: u128
) -> u128 {
    let amount_in_with_fee = amount_in * 997; // 0.3% fee to LPs
    let numerator = amount_in_with_fee * reserve_out;
    let denominator = (reserve_in * 1000) + amount_in_with_fee;
    numerator / denominator
}
```

#### getAmountIn
Calculates required input for a desired output:
```rust
fn get_amount_in(
    amount_out: u128,
    reserve_in: u128,
    reserve_out: u128
) -> u128 {
    let numerator = reserve_in * amount_out * 1000;
    let denominator = (reserve_out - amount_out) * 997;
    (numerator / denominator) + 1
}
```

### Multi-hop Calculations

#### getAmountsOut
Calculates outputs for a multi-hop swap path:
```rust
fn get_amounts_out(
    amount_in: u128,
    path: Vec<AlkaneId>
) -> Vec<u128> {
    let mut amounts = vec![amount_in];
    
    for i in 0..(path.len() - 1) {
        let (reserve_in, reserve_out) = get_reserves(path[i], path[i + 1]);
        let amount_out = get_amount_out(amounts[i], reserve_in, reserve_out);
        amounts.push(amount_out);
    }
    
    amounts
}
```

#### getAmountsIn
Calculates inputs for a multi-hop swap path:
```rust
fn get_amounts_in(
    amount_out: u128,
    path: Vec<AlkaneId>
) -> Vec<u128> {
    let mut amounts = vec![amount_out];
    
    for i in (1..path.len()).rev() {
        let (reserve_in, reserve_out) = get_reserves(path[i - 1], path[i]);
        let amount_in = get_amount_in(amounts[0], reserve_in, reserve_out);
        amounts.insert(0, amount_in);
    }
    
    amounts
}
```

### Mathematical Utilities

#### sqrt
Square root function for LP token calculations:
```rust
fn sqrt(x: u128) -> u128 {
    if x == 0 {
        return 0;
    }
    
    let mut z = (x + 1) / 2;
    let mut y = x;
    
    while z < y {
        y = z;
        z = (x / z + z) / 2;
    }
    
    y
}
```


## Integration Examples

### Calculate Swap Output
```rust
// Calculate expected output for 100 token A
let (reserve_a, reserve_b) = get_reserves(token_a, token_b);
let output = get_amount_out(100_000_000, reserve_a, reserve_b);
println!("Expected output: {}", output);
```

### Multi-hop Swap Calculation
```rust
// Calculate output for A -> B -> C swap
let path = vec![token_a, token_b, token_c];
let amounts = get_amounts_out(100_000_000, path);
println!("Final output: {}", amounts[amounts.len() - 1]);
```


### Price Impact Analysis
```rust

#### calculatePriceImpact
Calculates price impact of a trade:
```rust
fn calculate_price_impact(
    amount_in: u128,
    reserve_in: u128,
    reserve_out: u128
) -> u128 {
    let price_before = reserve_out * PRECISION / reserve_in;
    let amount_out = get_amount_out(amount_in, reserve_in, reserve_out);
    let new_reserve_in = reserve_in + amount_in;
    let new_reserve_out = reserve_out - amount_out;
    let price_after = new_reserve_out * PRECISION / new_reserve_in;
    
    (price_before - price_after) * 10000 / price_before // Return as basis points
}

// Check price impact before executing trade
let impact = calculate_price_impact(trade_amount, reserve_in, reserve_out);
if impact > 500 { // More than 5%
    println!("Warning: High price impact of {}%", impact / 100);
}
```

## Best Practices

### Precision Handling
- Use appropriate precision constants
- Handle rounding errors carefully
- Test edge cases with extreme values

### Safety First
- Always validate inputs
- Check for overflow/underflow
- Implement proper error handling

The library functions form the mathematical foundation of the Oyl AMM protocol, providing reliable and efficient calculations for all trading and liquidity operations.