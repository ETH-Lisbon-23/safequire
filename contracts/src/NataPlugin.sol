// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeRootAccess, SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";
import {IOwnable} from "./interfaces/IOwnable.sol";

/**
 * @title NataPlugin executes root transactions through 2 Safes to atomically swap
 * ... the ownership of this safe for another newly-created Safe containing the requested amount of ETH.
 */
contract NataPlugin is BasePluginWithEventMetadata {
    // ************************************* //
    // *             Storage               * //
    // ************************************* //
    // Reminder: state must be safe-specific
    mapping(address => Listing) public sellerSafeToListings;

    // ************************************* //
    // *         Enums / Structs           * //
    // ************************************* //
    struct Listing {
        ISafe sellerSafe;
        ISafe proceedsSafe;
        uint256 price;
        bool sold;
    }

    // ************************************* //
    // *              Events               * //
    // ************************************* //
    event ListedForSale(address indexed safe, uint price);
    event OwnerReplaced(address indexed safe, address oldOwner, address newOwner);
    event Sold(address indexed safe, address indexed buyer);

    // ************************************* //
    // *            Constructor            * //
    // ************************************* //
    constructor()
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "Nata Plugin",
                version: "1.0.0",
                requiresRootAccess: true,
                iconUrl: "", //"https://raw.githubusercontent.com/nata-finance/nata/main/web/public/nata.png",
                appUrl: "https://nata.vercel.app"
            })
        )
    {
        // NOP
    }

    // ************************************* //
    // *         State Modifiers           * //
    // ************************************* //

    /**
     * @notice List a Safe for sale.
     * @param _manager Address of the Safe{Core} Protocol Manager.
     * @param _safe Safe account for sale
     * @param _price Price in wei
     */
    function listForSale(ISafeProtocolManager _manager, ISafe _safe, uint256 _price) external {
        require(msg.sender == address(_safe), "Unauthorized");

        ISafe proceedsSafeAddress = ISafe(address(0)); // TODO: deployNewSafe() with address(this) as owner

        sellerSafeToListings[address(_safe)] = Listing({
            sellerSafe: _safe,
            proceedsSafe: proceedsSafeAddress,
            price: _price,
            sold: false
        });

        emit ListedForSale(address(this), _price);
    }

    /**
     * @notice Buy a Safe.
     * @param _manager Address of the Safe{Core} Protocol Manager.
     * @param _safe Safe account for sale
     */
    function buy(ISafeProtocolManager _manager, ISafe _safe) external {
        Listing memory listing = sellerSafeToListings[address(_safe)];

        require(address(listing.proceedsSafe) != address(0), "Not for sale");
        require(address(listing.proceedsSafe).balance >= listing.price, "Not enough funds");
        require(listing.sold == false, "Already sold");
        
        listing.sold = true; // Check-Effects-Interactions

        // Swap transfer safes ownership
        address buyer = msg.sender;
        address seller = IOwnable(address(_safe)).getOwners()[0];
        _replaceOwner(_manager, _safe, seller, buyer); // Seller -> Buyer
        _replaceOwner(_manager, listing.proceedsSafe, address(this), seller); // NataPlugin -> Seller
        
        emit Sold(address(this), msg.sender);
    }

    // ************************************* //
    // *            Internal               * //
    // ************************************* //

    function _replaceOwner(ISafeProtocolManager _manager, ISafe _safe, address _oldOwner, address _newOwner) internal {
        // Assuming only 1 owner for now
        // TODO: support multiple owners
        bytes memory txData = abi.encodeWithSignature("swapOwner(address,address,address)", address(0x1), _oldOwner, _newOwner);
        SafeProtocolAction memory safeProtocolAction = SafeProtocolAction(payable(address(_safe)), 0, txData);
        SafeRootAccess memory safeTx = SafeRootAccess(safeProtocolAction, 0, "");
        _manager.executeRootAccess(_safe, safeTx);

        emit OwnerReplaced(address(_safe), _oldOwner, _newOwner);
    }
}
