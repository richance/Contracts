// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface donation {
    function reset() public returns (bool);
}

contract dTap {
    IERC20 public Token;
    donation public Pool;
    uint256 public blocklock;
    address public bucket;

    constructor(
        IERC20 Tokent,
        address buckt,
        donation Poolt
    ) public {
        Token = Tokent;
        bucket = buckt;
        Pool = Poolt;
    }

    function tap() public {
        require(tx.origin == msg.sender, "UTap: External accounts only");
        require(blocklock <= now, "block");
        Token.transfer(bucket, Token.balanceOf(address(this)) / 100);
        blocklock = now + 20 hours;
        Pool.reset();
    }
}
