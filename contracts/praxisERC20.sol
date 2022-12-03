// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import {Ownable} from "openzeppelin-contracts/access/Ownable.sol";

contract praxisERC20 is ERC20, Ownable {
    address immutable factory;
    uint256 nonce;

    constructor(address _factory) ERC20("PRAXIS", "PRX") {
        factory = _factory;
    }

    function mint(address _user, uint256 _amount) external onlyOwner {
        nonce++;
        _mint(_user, _amount);
    }

    function burn(address _user, uint256 _amount) external onlyOwner {
        _burn(_user, _amount);
    }
}
