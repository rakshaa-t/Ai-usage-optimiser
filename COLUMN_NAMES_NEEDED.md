# CSV Column Names the Optimizer Looks For

## Current Implementation:
The analyzer looks for these column names (case-sensitive):

### For Cost:
- `cost`
- `total_cost`
- `price`
- `amount`
- `usd`

### For Model Names:
- `model`
- `model_name`
- `model_id`
- `engine`

### For Tokens:
- `tokens`
- `total_tokens`
- `token_count`
- `usage`

## Cursor CSV Format:
Cursor exports typically have columns like:
- `Date`
- `Model`
- `Cost`
- `Input Tokens`
- `Output Tokens`
- `Total Tokens`
- `Max Mode`

## The Fix Needed:
Add more column name variations to match Cursor's format!
