// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;


import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Donation {
    IERC20 public Token;
    uint256 public start;
    uint256 public finish;
    address payable public ad1;
    address payable public ad2;
    address payable public ad3;
    address payable public ad4;

    constructor(
        IERC20 Tokent,
        address payable a1,
        address payable a2,
        address payable a3,
        address payable a4
    ) public {
        Token = Tokent;
        start = now;
        finish = now + 100 days;
        ad1 = a1;
        ad2 = a2;
        ad3 = a3;
        ad4 = a4;
    }

    receive() external payable {
        Token.transfer(
            msg.sender,
            (msg.value * 10 * (finish - start)) /
                ((finish - start) - (now - start))
        );
    }

    uint256 public bal;

    function donate() public {
        bal = address(this).balance;
        _transfer(ad1, bal / 4);
        _transfer(ad2, bal / 4);
        _transfer(ad3, bal / 4);
        _transfer(ad4, bal / 4);
    }

    function _transfer(address payable to, uint256 amount) internal {
      (bool success,) = to.call{value: amount}("");
      require(success, "Donation: Error transferring ether.");
    }
}
