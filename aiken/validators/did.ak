use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/transaction.{OutputReference, Transaction, ScriptContext, Mint}
use aiken/transaction/credential.{VerificationKey}

type Action {
  Mint
  Burn
}

validator {
  fn did_policy(owner: VerificationKeyHash, action: Action, ctx: ScriptContext) -> Bool {
    let ScriptContext { transaction, purpose } = ctx
    expect Mint(_policy_id) = purpose

    when action is {
      Mint -> {
        // To mint, the transaction must be signed by the owner
        list.has(transaction.extra_signatories, owner)
      }
      Burn -> True // Allow burning freely (or restrict if needed)
    }
  }
}
