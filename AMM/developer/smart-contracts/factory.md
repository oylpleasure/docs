---
sidebar_position: 1
---

# Factory Contract

The Factory contract is the central registry and management system for all trading pairs in the Oyl AMM protocol. It handles pool creation, routing, and protocol-wide operations.

## Contract Overview

The Factory contract serves as:
- **Pool Registry**: Maintains a list of all trading pairs
- **Pool Creator**: Deploys new pool contracts
- **Router**: Handles multi-hop swaps and liquidity operations
- **Fee Manager**: Collects protocol fees

## Core Functions

### Pool Management

#### InitFactory
Initializes the factory with required parameters:
```rust
#[opcode(0)]
InitFactory {
    pool_factory_id: u128,      // Pool factory contract ID
    auth_token_units: u128,     // Authentication token units
}
```

#### CreateNewPool
Creates a new trading pair:
```rust
#[opcode(1)]
CreateNewPool
```

This function:
- Deploys a new pool contract
- Registers the pool in the factory
- Sets up initial pool parameters

#### FindExistingPoolId
Finds the pool ID for a token pair:
```rust
#[opcode(2)]
FindExistingPoolId {
    alkane_a: AlkaneId,         // First token
    alkane_b: AlkaneId,         // Second token
}
```

Returns the pool ID if it exists, or creates a new pool if it doesn't.

### Pool Information

#### GetAllPools
Returns a list of all pools:
```rust
#[opcode(3)]
#[returns(Vec<u8>)]
GetAllPools
```

#### GetNumPools
Returns the total number of pools:
```rust
#[opcode(4)]
#[returns(Vec<u8>)]
GetNumPools
```

### Configuration

#### SetPoolFactoryId
Updates the pool factory ID:
```rust
#[opcode(7)]
SetPoolFactoryId { 
    pool_factory_id: u128 
}
```

This function is restricted to authorized users only.

## Liquidity Operations

### AddLiquidity
Adds liquidity to a trading pair:
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

The function:
1. Finds or creates the pool for the token pair
2. Calculates optimal amounts based on current reserves
3. Transfers tokens to the pool
4. Mints LP tokens to the user

### Burn (Remove Liquidity)
Removes liquidity from a trading pair:
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

## Trading Operations

### SwapExactTokensForTokens
Swaps an exact amount of input tokens for output tokens:
```rust
#[opcode(13)]
SwapExactTokensForTokens {
    path: Vec<AlkaneId>,        // Token path for the swap
    amount_out_min: u128,       // Minimum output amount
    deadline: u128,             // Transaction deadline
}
```

### SwapTokensForExactTokens
Swaps tokens to get an exact amount of output tokens:
```rust
#[opcode(14)]
SwapTokensForExactTokens {
    path: Vec<AlkaneId>,        // Token path for the swap
    amount_out: u128,           // Exact output amount desired
    amount_in_max: u128,        // Maximum input amount
    deadline: u128,             // Transaction deadline
}
```

## Fee Management

### CollectFees
Collects protocol fees from a specific pool:
```rust
#[opcode(10)]
CollectFees { 
    pool_id: AlkaneId 
}
```

This function:
- Calculates accumulated protocol fees
- Transfers fees to the protocol treasury
- Updates pool fee tracking

## Access Control

### Authentication
The Factory contract implements authentication mechanisms:
- Critical functions require proper authorization
- Uses the Alkanes authentication system
- Protects against unauthorized access

### Permissions
Different functions have different permission levels:
- **Public**: Pool queries, swaps
- **User**: Liquidity operations
- **Admin**: Configuration changes, fee collection

## Integration Examples

### Creating a Pool
```rust
// Create a new pool for TOKEN_A/TOKEN_B
let factory = get_factory_contract();
factory.call(AMMFactoryMessage::CreateNewPool)?;
```

### Finding a Pool
```rust
// Find existing pool for a token pair
let pool_id = factory.call(AMMFactoryMessage::FindExistingPoolId {
    alkane_a: token_a_id,
    alkane_b: token_b_id,
})?;
```

### Adding Liquidity
```rust
// Add liquidity to a pool
factory.call(AMMFactoryMessage::AddLiquidity {
    token_a: token_a_id,
    token_b: token_b_id,
    amount_a_desired: 1000_000_000,
    amount_b_desired: 2000_000_000,
    amount_a_min: 950_000_000,
    amount_b_min: 1900_000_000,
    deadline: current_time + 300,
})?;
```

### Executing a Swap
```rust
// Swap TOKEN_A for TOKEN_B
let path = vec![token_a_id, token_b_id];
factory.call(AMMFactoryMessage::SwapExactTokensForTokens {
    path,
    amount_out_min: 95_000_000,
    deadline: current_time + 300,
})?;
```

## Best Practices

### Pool Creation
- Check if pool exists before creating
- Ensure tokens are valid Alkane IDs
- Consider initial liquidity requirements

### Liquidity Management
- Set appropriate slippage tolerances
- Use reasonable deadlines
- Monitor pool ratios before adding liquidity

### Trading
- Calculate expected outputs off-chain
- Set appropriate minimum outputs
- Consider gas costs for multi-hop swaps

The Factory contract is the main entry point for most Oyl AMM operations, providing a unified interface for pool management, liquidity operations, and trading.