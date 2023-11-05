Very useful diagrams
https://github.com/safe-global/safe-core-protocol/blob/0f3ee326009709a705eb560712bad070b52d8890/docs/execution_flows.md


NATA Plugin: 
0x51157d3C0fD2b9611E9C0E07f7CeBCB906d81EAd OLD
0xfa098e621eaC8438CC84e5D26e9EE5123B825350 OLD
0x4cE31703c10E90ecEF692DF8fA14ab938F899e31 OLD
0xCb29EcfD0a6c5DEb4f40F3AE3FD3DDa9A2A1B995

Add module to TestSafeProtocolRegistryUnrestricted
https://goerli.etherscan.io/address/0x2b18E7246d213676a0b9741fE860c7cC05D75cE2#writeContract#F2 (wrong version, for v0.3.0)
https://goerli.etherscan.io/address/0xe8f280Cb2ddFaE13a9ECF50DEdB8A0BF77534430 NO, not used despite being listed here https://github.com/safe-global/safe-core-protocol/blob/v0.2.0-alpha.1/docs/deployments.md
https://goerli.etherscan.io/address/0x9EFbBcAD12034BC310581B9837D545A951761F5A = Registry



New SAFE (must be marked as proxy manually in Etherscan)
https://goerli.etherscan.io/address/0x032487513ba6b20Cd154e682A33fCDd6A7E88291#writeProxyContract

Add module to Safe via the TX builder
https://app.safe.global/apps/open?safe=gor:0x032487513ba6b20Cd154e682A33fCDd6A7E88291&appUrl=https%3A%2F%2Fapps-portal.safe.global%2Ftx-builder

Safe Manager?
safe: call `manager.enablePlugin(nataPluginAddress, true)` so that manager.isPluginEnabled(sellerSafe, nataPluginAddress) == true
manager: 0xAbd9769A78Ee63632A4fb603D85F63b8D3596DF9
manager.registry == 0x9EFbBcAD12034BC310581B9837D545A951761F5A

More simple way to enable the module+plugin: https://app.safe.global/apps/open?safe=gor:0x032487513ba6b20Cd154e682A33fCDd6A7E88291&appUrl=https://5afe.github.io/safe-core-protocol-demo/#/plugins then find the plugin at the bottom and click Enable
