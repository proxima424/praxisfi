// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import {ERC20} from "openzeppelin-contracts/token/ERC20/ERC20.sol";

contract praxisERC20 is ERC20 {
    uint256 nonce = 0;
    address public owner;

    function setOwner(address _owner) external {
        require(nonce == 0);
        owner = _owner;
        nonce++;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() ERC20("PRAXIS_WETH3XUP", "WETH3XUP") {}

    function mint(address _user, uint256 _amount) external onlyOwner {
        nonce++;
        _mint(_user, _amount);
    }

    function burn(address _user, uint256 _amount) external onlyOwner {
        _burn(_user, _amount);
    }
}
