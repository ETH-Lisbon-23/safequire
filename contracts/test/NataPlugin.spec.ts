import hre, { deployments, ethers } from "hardhat";
import { expect } from "chai";
import { getProtocolManagerAddress } from "../scripts/protocol";
import { getNataPlugin } from "./utils/contracts";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ISafeProtocolManager__factory } from "../typechain-types";
import { SafeProtocolAction, SafeRootAccess } from "../scripts/dataTypes";
import { MaxUint256, ZeroHash } from "ethers";

describe("NataPlugin", () => {
    let deployer: SignerWithAddress,
        seller: SignerWithAddress,
        buyer: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress;

    before(async () => {
        [deployer, seller, buyer, user1, user2] = await hre.ethers.getSigners();
    });

    const setup = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();

        const manager = await ethers.getContractAt("MockContract", await getProtocolManagerAddress(hre));
        const account = await (await ethers.getContractFactory("ExecutableMockContract")).deploy();
        const plugin = await getNataPlugin(hre);
        return {
            account,
            plugin,
            manager,
        };
    });

    it("Should list a Safe for sale", async () => {
        const { account, plugin, manager } = await setup();
        const managerInterface = ISafeProtocolManager__factory.createInterface();

        expect(
            await plugin
                .connect(seller)
                .listForSale(manager.target, buyer.address, 1000),
        )
            .to.emit(plugin, "ListedForSale")
            .withArgs(account.target, 1000);
    });

    it("Should transfer safe ownership upon a successful sale", async () => {
        const { account, plugin, manager } = await setup();
        const managerInterface = ISafeProtocolManager__factory.createInterface();

        expect(
            await plugin
                .connect(buyer)
                .buy(manager.target, buyer.address),
        )
            .to.emit(plugin, "Sold")
            .withArgs(account.target, buyer.address);

        const safeInterface = new hre.ethers.Interface(["function swapOwner(address,address,address)"]);
        const data = safeInterface.encodeFunctionData("swapOwner", [buyer.address, user1.address, user2.address]);

        const safeProtocolAction: SafeProtocolAction = {
            to: account.target,
            value: 0n,
            data: data,
        };

        const safeRootAccessTx: SafeRootAccess = { action: safeProtocolAction, nonce: 0n, metadataHash: ZeroHash };
        const callData = managerInterface.encodeFunctionData("executeRootAccess", [account.target, safeRootAccessTx]);
        expect(await manager.invocationCount()).to.equal(1);
        expect(await manager.invocationCountForCalldata(callData)).to.equal(1);
    });
});
