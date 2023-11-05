'use client'

import React, { useEffect } from 'react';
import styles from './page.module.css'
import { ethers } from 'ethers'
import { EthersAdapter } from '@safe-global/protocol-kit'
import { IExecWeb3mail } from "@iexec/web3mail"
import Safe from '@safe-global/protocol-kit'
import Image from 'next/image'
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
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
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
setOpen(true);
  }
  const [messageContent, setMessageContent] = React.useState("");
  const handleClose = () => setOpen(false);
  const handleSendEmail = () => {
    if (typeof window.ethereum === 'undefined') {
      console.log('No window.ethereum detected')
      setOpen(false)
      return
    } else {
      const web3Provider = window.ethereum
      const web3mail = new IExecWeb3mail(web3Provider)
      const protectedData = "0x6CdeD5136653D9AafC4A51226f28aC3A6E977E91"
      const emailSubject = 'You have received an message from a potential acquirer - Nata'
      const emailContent = messageContent+ ""
      web3mail.sendEmail({
          protectedData,
          emailSubject,
          emailContent
      })
      setOpen(false)
    }
  };
  const handleSendNotification= () => {
    // To be completed (see protectData repository)
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessageContent(event.target.value);
  };

  const safeAddress = '0xAecDFD3A19f777F0c03e6bf99AAfB59937d6467b'
  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'gray',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

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
          <Button variant="contained" onClick={handleOpen} sx={{float: 'right'}} >Contact</Button>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{borderRadius: '10px'}}
          >
            <Box sx={style}>
              <div style={{display: 'grid', flexDirection: 'row' }}>
              <TextField
                id="outlined-basic" label="Contact DAO privately" variant="outlined"
                sx={{marginBottom: '16px',borderBlockColor: 'black'}}
                onChange={handleInputChange}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="contained" onClick={handleSendEmail}>Send email</Button>
                <Button variant="contained" onClick={handleSendNotification}>Send notification</Button>
              </div>

              </div>
            </Box>
          </Modal>
        </div>
      </main>
    </>
  )
}
