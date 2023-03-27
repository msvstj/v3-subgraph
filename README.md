# Uniswap V3 Subgraph
Uniswap V3 main subgraph with extended Position and Incentive entities. Forked from [Uniswap](https://github.com/Uniswap/v3-subgraph) and referenced from [vbstreetz](https://github.com/vbstreetz/uniswap-v3-staker-subgraph).
### Subgraph Endpoint 
- Goerli : https://api.thegraph.com/subgraphs/name/msvstj/uni-v3-extended-staking-goerli
- TBA
### Issues and Notes
- Circular relationship between Positions and Incentives (many-to-many relationship).
- More networks will be added.
# References:
- Uniswap (https://github.com/Uniswap/v3-subgraph) (GPL-3.0) - Main Uniswap V3 subgraph (used position, pool, token entitis).
- vbstreetz (https://github.com/vbstreetz/uniswap-v3-staker-subgraph) (MIT) - Incentive entity encoding and event handling.