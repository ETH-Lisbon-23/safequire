'use client'

import React, { useEffect } from 'react';
import styles from './page.module.css'
import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit, { TokenInfoListResponse, SafeInfoResponse } from '@safe-global/api-kit'
import Safe, { SafeFactory } from '@safe-global/protocol-kit'


// https://chainlist.org/?search=goerli&testnets=true

export default function Home() {
  const [balance, setBalance] = React.useState("0");
  const safeAddress = '0xAecDFD3A19f777F0c03e6bf99AAfB59937d6467b'

  useEffect(() => {
    async function fetchData() {
      // const RPC_URL = 'https://ethereum-goerli.publicnode.com';
      const RPC_URL='https://goerli.infura.io/v3/66e8fb8d96bd479b973af21abddb7ca2'

      const provider = new ethers.providers.JsonRpcProvider({ url: RPC_URL });

      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: provider,
      });

      const safeService = new SafeApiKit({
        txServiceUrl: 'https://safe-transaction-goerli.safe.global',
        ethAdapter,
      });

      console.log("============= SafeService: ", safeService);
      console.log("============= ethAdapter: ", await ethAdapter.getChainId());
      console.log("============= provider network: ", await provider.getNetwork())
      console.log("============= provider: ", provider.connection);
      const safeInfo: SafeInfoResponse = await safeService.getSafeInfo(safeAddress);
      const tokens: TokenInfoListResponse = await safeService.getTokenList()

      console.log(safeInfo);

      const safeSdk = await Safe.create({ ethAdapter, safeAddress })
      const balance = await safeSdk.getBalance();
      setBalance(ethers.utils.formatEther(balance));
      console.log("============= safeSdk: ", await safeSdk.getBalance());
      console.log("============= tokens: ", await safeService.getTokenList());
    }

    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      List Wallets<br />
      address: { safeAddress }<br />
      balance: { balance } ETH

    </main>
  )
}
