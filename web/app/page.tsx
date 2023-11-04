'use client'

import React, { useEffect } from 'react';
import styles from './page.module.css'
import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import Safe from '@safe-global/protocol-kit'
import Image from 'next/image'

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


export default function Home() {
  const [balance, setBalance] = React.useState("0");
  const [tokens, setTokens] = React.useState<any>();
  const safeAddress = '0xAecDFD3A19f777F0c03e6bf99AAfB59937d6467b'

  useEffect(() => {
    async function fetchData() {
      const RPC_URL='https://goerli.infura.io/v3/66e8fb8d96bd479b973af21abddb7ca2'
      const provider = new ethers.providers.JsonRpcProvider({ url: RPC_URL });
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: provider,
      });
      const safeSdk = await Safe.create({ ethAdapter, safeAddress })
      const balance = await safeSdk.getBalance();
      setBalance(ethers.utils.formatEther(balance));

      const tokens = await getBalanceTokens(safeAddress);
      setTokens(tokens);
    }

    fetchData();
  }, []);

  return (
    <>
      <w3m-button />
      <main className={styles.main}>
        <div>
          <Image src="/nata.png" alt="Nata Finance Logo" width={120} height={120} />
        </div>
        <h2 className={styles.title}>M&A Wallets</h2>
        <div className={styles.card}>
          <h2>{ safeAddress }</h2>
          <span>{ balance } ETH</span>

          <p>
          {tokens?.balances.map((token:any) => {
            const tokenBalance = parseFloat(parseFloat(ethers.utils.formatEther(token.balance)).toFixed(2));
            if (tokenBalance <= 0 || token.token === null) return null;

            return (
              <>
                { tokenBalance } { token.token.symbol } <br />
              </>
            )
          })}
          </p>
        </div>
      </main>
    </>
  )
}
