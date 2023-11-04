'use client'

import React, { useEffect } from 'react';
import styles from './page.module.css'
import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import SafeApiKit, { TokenInfoListResponse, SafeInfoResponse } from '@safe-global/api-kit'
import Safe from '@safe-global/protocol-kit'

// import { getBalanceTokens } from './services/BalanceToken';
import axios from 'axios';

const getBalanceTokens = async (address: string) => {
  try {
    const response = await axios.get(`https://safe-transaction-goerli.safe.global/api/v1/safes/0xAecDFD3A19f777F0c03e6bf99AAfB59937d6467b/balances`)
    const balances = response.data;

    return {
      status: 'ok',
      balances
    };
  } catch (error) {
    return {
      status: 'error',
      error
    };
  }
};


// https://chainlist.org/?search=goerli&testnets=true

export default function Home() {
  const [balance, setBalance] = React.useState("0");
  const [tokens, setTokens] = React.useState<any>();
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
      // const tokens: TokenInfoListResponse = await safeService.getTokenList()

      console.log(safeInfo);

      const safeSdk = await Safe.create({ ethAdapter, safeAddress })
      const balance = await safeSdk.getBalance();
      setBalance(ethers.utils.formatEther(balance));
      console.log("============= safeSdk: ", await safeSdk.getBalance());
      console.log("============= tokens: ", await safeService.getTokenList());
      console.log("============= tokens 0x388e3A1BE71A4c37F1585d8276ffDb28b583406A ", await safeService.getToken('0x388e3A1BE71A4c37F1585d8276ffDb28b583406A'));
      const tokens = await getBalanceTokens(safeAddress);
      setTokens(tokens);
      console.log("============= balanceTokens: ", tokens);
    }

    fetchData();
  }, []);

  return (
    <>
      <w3m-button />
      <main className={styles.main}>
        List Wallets<br />
        address: { safeAddress }<br />
        balance: { balance } ETH<br />

        {tokens?.balances.map((token:any) => {
          const tokenBalance = parseFloat(parseFloat(ethers.utils.formatEther(token.balance)).toFixed(2));
          console.log("==========_________________ token: ", token);
          if (tokenBalance <= 0 || token.token === null) return null;

          return (
            <>
              { tokenBalance } { token.token.symbol } <br />
            </>
          )
        })}


      </main>
    </>
  )
}
