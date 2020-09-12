# Sprout

September 11th 2020

Audit prepared by The Pulver Group DBA

## Executive Summary

Type: Governance Scheme / ERC20 Deployment
Auditors: Raymond Pulver

Timeline: September 10th-11th 2020

Languages: Solidity

Methods: Architecture Review/Rewrite, Manual Review

Specification: None

Documentation Quality: N/A

Test Quality: N/A

Source Code: [https://github.com/SproutdotMoney/Contracts](https://github.com/SproutdotMoney/Contracts)

Goals:

- Provide more reliable architecture for orchestration and secure dependency management
- Examine codebase for common vulnerabilities
- Examine codebase for vulnerabilities specific to Sprout

## Total Issues (1)

- Tok.sol (Critical, Resolved)
  - Overflow attack possible during voting bookkeeping within _transfer(address,address,uint256)
  - Attack:
    - Calls updateVote for a malicious treasurer which has a small total amount of votes
    - Receives more token from another user
    - Transfers an amount of token to any other address that is greater than the total amount of voting weight accumulated for the treasurer
    - Result: Total weight held by treasurer overflows during subtraction and results in the malicious treasurer being able to be set as treasurer at any point

Note: Dependencies were factored out of contract codebase and installed with npm, project migrated to buidler, dependencies are @openzeppelin/contracts and @uniswap/v2-core, not audited in this review

## Summary

Codebase could make use of a proper test suite and linting. Prettier has been installed to the project for formatting. SafeMath is ostensibly under utilized, but there is no security risk in the arithmetic expressions used across the entire system. Loss of precision can occur in the token deflation system so high precision should always be used by Tok.sol. 18 decimals of precision is more than sufficient.
