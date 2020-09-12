Mudit Gupta is the Lead Blockchain Engineer at Polymath. Mudit is a renowned Security Researcher who has disclosed security vulnerabilities in projects like Polkadot and Nexus Mutual. 
https://mudit.blog/
report on GitHub
https://github.com/maxsam4/SproutdotMoney-token-audit#

---------

## Summary

I was asked to do a security audit of SproutdotMoney's token contract (`Tok.sol`). The exact version of the contract audited is available at <https://github.com/SproutdotMoney/Contracts/blob/fc01fbd0c42ee92f5736d7b2d78f5b8f1f7802a6/contracts/Tok.sol>.

The audit's focus was to verify that the token contract system is secure, resilient, and working according to its specifications. The audit activities can be grouped in the following three categories:

**Security**: Identifying security related issues within the contract.

**Sound Architecture**: Evaluation of this contract's architecture through the lens of established smart contract best practices and general software best practices.

**Code Correctness and Quality**: A full review of the contract's source code.

No guarantees can be made or are being made based on this audit.

## Issues discovered

During the review, 1 Critical, 0 Major, 3 Minor, and 8 Informational issues were found.

- A critical issue represents something that can be relatively easily exploited and will likely lead to loss of funds.
- A major issue represents something that can result in an unintended behavior of the smart contracts. These issues can also lead to loss of funds but are typically harder to execute than critical issues.
- A minor issue represents an oddity discovered during the review. These issues are typically situational, hard to exploit and, posses practically no security risk.
- An informational issue represents a potential improvement. These issues do not pose any security risks.

NOTE: The SproutdotMoney team fixed the critical issue on their own before I reported it to them.

### Critical

#### 1.1 Possibility of underflowing votes and taking over the treasury address

In L278 of Tok.sol, inside the `_transfer` function, `msg.sender` is used instead of `sender`. The `msg.sender` can be different from `sender` in case of `transferFrom`. This means, the `voted` variable of a different user is used to update the vote tally than the intended user. It can be used to underflow the vote tally and then call `setNewTDao` to become the `treasury`.

Consider an example with Alice, Bob and Charlie. Assume Alice and Bob have 10 tokens while Charlie has 100.

- Alice calls `updateVote` to vote for herself becoming the treasury. votet[alice] and voted[alice] become equal to 10.
- Bob calls `updateVote` to vote for Charlie becoming the treasury. votet[charlie] and voted[bob] become equal to 10.
- Charlie transfers 1 token to Bob.
- Bob gives transfer approval to Alice by calling `approve`.
- Alice calls `transferFrom` to transfer 11 tokens from Bob to Charlie.
- L278 is triggered and voted[bob] is set to zero but votet[alice] is reduced by voted[alice]. votet[alice] and voted[bob] becomes 0 while voted[alice] and votet[charlie] stay the same.
- Bob calls `updateVote` again to vote for Charlie becoming the treasury. votet[charlie] and voted[bob] increase by 1. This way, bob can increase `votet[charlie]` without holding the tokens.
- Charlie transfers 1 token to Bob.
- Alice calls `transferFrom` to transfer 1 token from Bob to Charlie.
- L278 is triggered and voted[bob] is set to zero but votet[alice] is reduced by voted[alice]. voted[bob] becomes 0 while voted[alice] and votet[charlie] stay the same. Since votet[alice] was already 0, it underflows and goes to the max value of u256.
- Alice calls `setNewTDao` to declare herself as the treasury.

It is an easy fix, L278 should use `sender` instead of `msg.sender`. The SproutdotMoney team fixed it on their own before I disclosed this vulnerability to them.

### Minor

#### 3.1 Missing test cases

There are no test cases in the codebase. It's recommended to add unit tests with a goal of 100% code coverage.

#### 3.2 Variable declared at a wrong place

`amount` is declared as a storage variable in L252 however, it should have been declared as a memory variable in the `_transfer` function.

This issue has been fixed.


#### 3.3 Events are not enough to deduce current balances

The `transfer` event is not sufficient to construct balances of users because a part of the transfer amount is given to the treasury. No event is emitted when the treasury changes, so it's not possible to keep track of balances using just the events.

It is recommended to emit an event when the treasury is set and changed so that it becomes possible to track balances using just the events. The events are not very useful otherwise.

### Informational

#### 4.1 OpenZeppelin contracts are not pinned to an exact version

The contracts imported contracts should be pinned to an exact version to prevent a future upgrade from changing the intended functionality.

This issue has been fixed.

#### 4.2 `yarn build` is not working

`yarn && yarn build` doesn't work out of the box because `@ethersproject/providers` is a required dependency, but it is not declared in package.json. Also, yarn tries to call the globally installed `buidler` instead of the locally installed version.

This issue has been fixed.

#### 4.3 Some code comments are not up to date

Some code comments still reference old functionality that has been reworked. The code comments are hence out of date and not accurate.

This issue has been fixed.

#### 4.4 Functions are marked as `virtual`

Some functions like `transfer` are marked as `virtual`, but there's no intention of re-declaring them elsewhere. There is no need to mark them `virtual`.

#### 4.5 Dust can be wasted in transfers

The calculations done to calculate the transfer amounts can cause some negligible amount of dust to be left behind. This will cause the total supply to no longer be equal to the sum of all balances. The difference will be minute, so it is not a security issue, but it can become an accounting issue.

#### 4.6 `_setupDecimals` can never be called

`_setupDecimals` is declared as an internal function, but it is never used. It can safely be removed.

#### 4.7 `setNewTDao` requires 51% majority instead of >50% majority

It is not a security issue, but the intention here was likely to require a majority vote. The majority should be calculated as >50% rather than >=51%.

#### 4.8 Variables can be named better

Some variable names like `votet`, `voted`, `votedad` and `amountt` are not clear at first glance. It is recommended to rename them to something easier to understand.

