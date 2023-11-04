// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {ISafe} from "@safe-global/safe-core-protocol/contracts/interfaces/Accounts.sol";
import {ISafeProtocolManager} from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import {SafeTransaction, SafeProtocolAction} from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import {BasePluginWithEventMetadata, PluginMetadata} from "./Base.sol";

/**
 * @title OwnerManager
 * @dev This interface is defined for use in NataPlugin contract.
 */
interface OwnerManager {
    function isOwner(address owner) external view returns (bool);
}

/**
 * @title NataPlugin maintains a mapping that stores information about accounts that are
 *        permitted to execute non-root transactions through a Safe account.
 * @notice This plugin does not need Safe owner(s) confirmation(s) to execute Safe txs once enabled
 *         through a Safe{Core} Protocol Manager.
 */
contract NataPlugin is BasePluginWithEventMetadata {
    // safe account => account => Nata status
    mapping(address => mapping(address => bool)) public whitelistedAddresses;

    event AddressWhitelisted(address indexed account);
    event AddressRemovedFromWhitelist(address indexed account);

    error AddressNotWhiteListed(address account);
    error CallerIsNotOwner(address safe, address caller);

    constructor()
        BasePluginWithEventMetadata(
            PluginMetadata({
                name: "Nata Plugin", 
                version: "1.0.0", 
                requiresRootAccess: true, 
                iconUrl: "https://raw.githubusercontent.com/nata-finance/nata/main/web/public/nata.png", 
                appUrl: "https://google.com"
            })
        )
    {}

    /**
     * @notice Executes a Safe transaction if the caller is whitelisted for the given Safe account.
     * @param manager Address of the Safe{Core} Protocol Manager.
     * @param safe Safe account
     * @param safetx SafeTransaction to be executed
     */
    function executeFromPlugin(
        ISafeProtocolManager manager,
        ISafe safe,
        SafeTransaction calldata safetx
    ) external returns (bytes[] memory data) {
        address safeAddress = address(safe);
        // Only Safe owners are allowed to execute transactions to whitelisted accounts.
        if (!(OwnerManager(safeAddress).isOwner(msg.sender))) {
            revert CallerIsNotOwner(safeAddress, msg.sender);
        }

        SafeProtocolAction[] memory actions = safetx.actions;
        uint256 length = actions.length;
        for (uint256 i = 0; i < length; i++) {
            if (!whitelistedAddresses[safeAddress][actions[i].to]) revert AddressNotWhiteListed(actions[i].to);
        }
        // Test: Any tx that updates whitelist of this contract should be blocked
        (data) = manager.executeTransaction(safe, safetx);
    }

    /**
     * @notice Adds an account to whitelist mapping.
     *         The caller should be a Safe account.
     * @param account address of the account to be whitelisted
     */
    function addToWhitelist(address account) external {
        whitelistedAddresses[msg.sender][account] = true;
        emit AddressWhitelisted(account);
    }

    /**
     * @notice Removes an account from whitelist mapping.
     *         The caller should be a Safe account.
     * @param account address of the account to be removed from the whitelist
     */
    function removeFromWhitelist(address account) external {
        whitelistedAddresses[msg.sender][account] = false;
        emit AddressRemovedFromWhitelist(account);
    }

    function listForSale(uint _price) {
        // TODO: require msg.sender = this safe
        // TODO: deploy a safe to store any proceeds from the sale, 
        // the new safe is owned by this plugin.
        emit ListedForSale(address(this), price);

    }

    function buy() {
        // TODO: check if msg.value >= price

        // TODO: transfer ownership of this safe to the buyer
        // TODO: take ownership of the proceeds safe

        emit Bought(address(this), msg.sender);
    }
}
