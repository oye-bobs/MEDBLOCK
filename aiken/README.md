# MedBlock Aiken Contracts

This directory contains the Aiken smart contracts for the MedBlock DID system.

## Prerequisites

You need to have `aiken` installed.
Installation instructions: https://aiken-lang.org/installation-instructions

## Build

Run the following command to compile the contracts and generate `plutus.json`:

```sh
aiken build
```

The generated `plutus.json` will be used by the backend to construct transactions.
