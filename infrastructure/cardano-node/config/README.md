# Cardano Node Configuration for MEDBLOCK

This directory contains the configuration files for running a Cardano node on the Preprod testnet.

## Files

- **config.json**: Main node configuration file
- **topology.json**: Network topology and peer configuration
- **genesis/**: Genesis files (downloaded automatically on first run)

## Genesis Files

The genesis files referenced in `config.json` will be automatically downloaded when the Cardano node starts. They include:

- `byron.json`: Byron era genesis
- `shelley.json`: Shelley era genesis
- `alonzo.json`: Alonzo era genesis (smart contracts)
- `conway.json`: Conway era genesis (governance)

## Network Information

- **Network**: Preprod Testnet
- **Network Magic**: 1
- **Bootstrap Peer**: preprod-node.play.dev.cardano.org:3001

## Usage

These configuration files are automatically mounted into the Cardano node Docker container via `docker-compose.yml`.

To manually run a Cardano node with these configs:

```bash
cardano-node run \
  --topology topology.json \
  --database-path /path/to/db \
  --socket-path /path/to/node.socket \
  --config config.json
```

## Monitoring

The node exposes:
- **EKG metrics**: Port 12788
- **Prometheus metrics**: Port 12798

## Switching Networks

To switch to mainnet:
1. Update `CARDANO_NETWORK=mainnet` in `.env`
2. Replace config files with mainnet versions from [cardano-configurations](https://github.com/input-output-hk/cardano-configurations)
3. Update `CARDANO_NETWORK_MAGIC=764824073`
