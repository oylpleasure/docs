---
sidebar_position: 1
---

# API Reference

Complete reference for all Oyl AMM smart contract functions, including parameters, return values, and usage examples.

## Factory Contract API

### Pool Management

#### InitFactory
Initializes the factory contract with required parameters.

```rust
#[opcode(0)]
InitFactory {
    pool_factory_id: u128,      // Pool factory contract ID
    auth_token_units: u128,     // Authentication token units
}
```

**Parameters:**
- `pool_factory_id`: The ID of the pool factory contract
- `auth_token_units`: Units for authentication tokens

**Access:** Admin only

---

#### CreateNewPool
Creates a new trading pair pool.

```rust
#[opcode(1)]
CreateNewPool
```

**Returns:** Pool ID of the newly created pool

**Usage:**
```rust
let response = factory.call(AMMFactoryMessage::CreateNewPool)?;
let pool_id = response.into();
```

---

#### FindExistingPoolId
Finds the pool ID for a given token pair.

```rust
#[opcode(2)]
FindExistingPoolId {
    alkane_a: AlkaneId,         // First token
    alkane_b: AlkaneId,         // Second token
}
```

**Parameters:**
- `alkane_a`: First token in the pair
- `alkane_b`: Second token in the pair

**Returns:** Pool ID if exists, creates new pool if not

**Usage:**
```rust
let pool_id = factory.call(AMMFactoryMessage::FindExistingPoolId {
    alkane_a: token_a_id,
    alkane_b: token_b_id,
})?;
```

---

#### GetAllPools
Returns a list of all existing pools.

```rust
#[opcode(3)]
#[returns(Vec<u8>)]
GetAllPools
```

**Returns:** Serialized list of all pool IDs

---

#### GetNumPools
Returns the total number of pools.

```rust
#[opcode(4)]
#[returns(Vec<u8>)]
GetNumPools
```

**Returns:** Total number of pools as bytes

---

### Configuration

#### SetPoolFactoryId
Updates the pool factory ID (admin only).

```rust
#[opcode(7)]
SetPoolFactoryId { 
    pool_factory_id: u128 
}
```

**Parameters:**
- `pool_factory_id`: New pool factory ID

**Access:** Admin only

---

### Fee Management

#### CollectFees
Collects protocol fees from a specific pool.

```rust
#[opcode(10)]
CollectFees { 
    pool_id: AlkaneId 
}
```

**Parameters:**
- `pool_id`: Pool to collect fees from

**Access:** Admin only

---

### Liquidity Operations

#### AddLiquidity
Adds liquidity to a trading pair.

```rust
#[opcode(11)]
AddLiquidity {
    token_a: AlkaneId,          // First token
    token_b: AlkaneId,          // Second token
    amount_a_desired: u128,     // Desired amount of token A
    amount_b_desired: u128,     // Desired amount of token B
    amount_a_min: u128,         // Minimum amount of token A
    amount_b_min: u128,         // Minimum amount of token B
    deadline: u128,             // Transaction deadline
}
```

**Parameters:**
- `token_a`, `token_b`: Token pair
- `amount_a_desired`, `amount_b_desired`: Desired amounts to deposit
- `amount_a_min`, `amount_b_min`: Minimum amounts (slippage protection)
- `deadline`: Transaction must execute before this timestamp

**Returns:** Amounts deposited and LP tokens minted

---

#### Burn
Removes liquidity from a trading pair.

```rust
#[opcode(12)]
Burn {
    token_a: AlkaneId,          // First token
    token_b: AlkaneId,          // Second token
    liquidity: u128,            // Amount of LP tokens to burn
    amount_a_min: u128,         // Minimum amount of token A to receive
    amount_b_min: u128,         // Minimum amount of token B to receive
    deadline: u128,             // Transaction deadline
}
```

**Parameters:**
- `token_a`, `token_b`: Token pair
- `liquidity`: LP tokens to burn
- `amount_a_min`, `amount_b_min`: Minimum amounts to receive
- `deadline`: Transaction deadline

**Returns:** Actual amounts received

---

### Trading Operations

#### SwapExactTokensForTokens
Swaps an exact amount of input tokens for output tokens.

```rust
#[opcode(13)]
SwapExactTokensForTokens {
    path: Vec<AlkaneId>,        // Token path for the swap
    amount_out_min: u128,       // Minimum output amount
    deadline: u128,             // Transaction deadline
}
```

**Parameters:**
- `path`: Array of token IDs defining the swap path
- `amount_out_min`: Minimum output amount (slippage protection)
- `deadline`: Transaction deadline

**Returns:** Array of amounts for each step in the path

---

#### SwapTokensForExactTokens
Swaps tokens to get an exact amount of output tokens.

```rust
#[opcode(14)]
SwapTokensForExactTokens {
    path: Vec<AlkaneId>,        // Token path for the swap
    amount_out: u128,           // Exact output amount desired
    amount_in_max: u128,        // Maximum input amount
    deadline: u128,             // Transaction deadline
}
```

**Parameters:**
- `path`: Array of token IDs defining the swap path
- `amount_out`: Exact amount of output tokens desired
- `amount_in_max`: Maximum input amount willing to pay
- `deadline`: Transaction deadline

**Returns:** Array of amounts for each step in the path

---

## Pool Contract API

### Initialization

#### InitPool
Initializes a new pool with token pair information.

```rust
#[opcode(0)]
InitPool {
    alkane_a: AlkaneId,         // First token in the pair
    alkane_b: AlkaneId,         // Second token in the pair
    factory: AlkaneId,          // Factory contract address
}
```

**Parameters:**
- `alkane_a`, `alkane_b`: Token pair for this pool
- `factory`: Factory contract that created this pool

**Access:** Factory contract only

---

### Liquidity Management

#### AddLiquidity
Adds liquidity to the pool.

```rust
#[opcode(1)]
AddLiquidity
```

**Note:** This is typically called through the factory contract, not directly.

---

#### Burn
Removes liquidity from the pool.

```rust
#[opcode(2)]
Burn
```

**Note:** This is typically called through the factory contract, not directly.

---

### Trading

#### Swap
Executes a token swap (low-level function).

```rust
#[opcode(3)]
Swap {
    amount_0_out: u128,         // Amount of token0 to send out
    amount_1_out: u128,         // Amount of token1 to send out
    to: AlkaneId,               // Recipient address
    data: Vec<u128>,            // Additional data (for flash swaps)
}
```

**Parameters:**
- `amount_0_out`, `amount_1_out`: Amounts to send (one should be 0)
- `to`: Recipient of the output tokens
- `data`: Callback data for flash swaps (empty for regular swaps)

**Warning:** This is a low-level function. Use factory swap functions instead.

---

### Information Queries

#### GetReserves
Returns the current token reserves.

```rust
#[opcode(97)]
#[returns(u128, u128)]
GetReserves
```

**Returns:** `(reserve0, reserve1)` - current reserves of both tokens

**Usage:**
```rust
let (reserve_a, reserve_b) = pool.call(AMMPoolMessage::GetReserves)?;
```

---

#### GetPriceCumulativeLast
Returns cumulative prices for oracle functionality.

```rust
#[opcode(98)]
#[returns(u128, u128)]
GetPriceCumulativeLast
```

**Returns:** `(price0_cumulative, price1_cumulative)` - cumulative prices

---

#### GetName
Returns the pool's name.

```rust
#[opcode(99)]
#[returns(String)]
GetName
```

**Returns:** Pool name as string

---

#### PoolDetails
Returns comprehensive pool information.

```rust
#[opcode(999)]
#[returns(Vec<u8>)]
PoolDetails
```

**Returns:** Serialized pool information including tokens, reserves, and metadata

---

### Utility Functions

#### CollectFees
Collects accumulated fees from the pool.

```rust
#[opcode(10)]
CollectFees {}
```

**Access:** Admin only

---

#### ForwardIncoming
Handles incoming token transfers.

```rust
#[opcode(50)]
ForwardIncoming
```

**Note:** Internal function for token transfer handling.

---

## Library Functions

### Swap Calculations

#### get_amount_out
Calculates output amount for a given input.

```rust
fn get_amount_out(
    amount_in: u128,
    reserve_in: u128,
    reserve_out: u128
) -> u128
```

**Parameters:**
- `amount_in`: Input token amount
- `reserve_in`: Reserve of input token
- `reserve_out`: Reserve of output token

**Returns:** Output amount after fees

---

#### get_amount_in
Calculates required input for a desired output.

```rust
fn get_amount_in(
    amount_out: u128,
    reserve_in: u128,
    reserve_out: u128
) -> u128
```

**Parameters:**
- `amount_out`: Desired output amount
- `reserve_in`: Reserve of input token
- `reserve_out`: Reserve of output token

**Returns:** Required input amount

---

#### get_amounts_out
Calculates outputs for a multi-hop swap path.

```rust
fn get_amounts_out(
    amount_in: u128,
    path: Vec<AlkaneId>
) -> Vec<u128>
```

**Parameters:**
- `amount_in`: Initial input amount
- `path`: Array of token IDs for the swap path

**Returns:** Array of amounts for each step in the path

---

#### get_amounts_in
Calculates inputs for a multi-hop swap path.

```rust
fn get_amounts_in(
    amount_out: u128,
    path: Vec<AlkaneId>
) -> Vec<u128>
```

**Parameters:**
- `amount_out`: Final desired output amount
- `path`: Array of token IDs for the swap path

**Returns:** Array of amounts for each step in the path

---

## Error Codes

### Common Errors
- `InsufficientLiquidity`: Not enough liquidity in pool
- `InsufficientInputAmount`: Input amount too small
- `InsufficientOutputAmount`: Output amount below minimum
- `InvalidPath`: Invalid token path for swap
- `Expired`: Transaction deadline exceeded
- `Unauthorized`: Caller not authorized for operation

### Pool-Specific Errors
- `PoolNotFound`: Requested pool doesn't exist
- `InvalidTokenPair`: Invalid token combination
- `ReservesEmpty`: Pool has no liquidity
- `K`: Constant product invariant violated

### Factory-Specific Errors
- `PoolExists`: Pool already exists for token pair
- `InvalidFactory`: Invalid factory configuration
- `FeeTooHigh`: Fee exceeds maximum allowed

---

## Usage Examples

### Basic Swap
```rust
// Swap 100 Token A for Token B with 1% slippage tolerance
let path = vec![token_a_id, token_b_id];
let min_output = expected_output * 99 / 100; // 1% slippage

let result = factory.call(AMMFactoryMessage::SwapExactTokensForTokens {
    path,
    amount_out_min: min_output,
    deadline: current_time + 300, // 5 minutes
})?;
```

### Add Liquidity
```rust
// Add liquidity with 0.5% slippage tolerance
let min_a = amount_a_desired * 995 / 1000;
let min_b = amount_b_desired * 995 / 1000;

let result = factory.call(AMMFactoryMessage::AddLiquidity {
    token_a: token_a_id,
    token_b: token_b_id,
    amount_a_desired,
    amount_b_desired,
    amount_a_min: min_a,
    amount_b_min: min_b,
    deadline: current_time + 600, // 10 minutes
})?;
```

### Query Pool Information
```rust
// Get current reserves
let (reserve_a, reserve_b) = pool.call(AMMPoolMessage::GetReserves)?;

// Calculate current price
let price = reserve_b * PRECISION / reserve_a;

// Get pool details
let details = pool.call(AMMPoolMessage::PoolDetails)?;
```

This API reference provides complete documentation for integrating with the Oyl AMM protocol.