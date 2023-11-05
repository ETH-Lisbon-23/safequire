// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// Interface for the Gnosis Safe to interact with the getOwners function
interface IOwnable {
    function getOwners() external view returns (address[] memory);
}