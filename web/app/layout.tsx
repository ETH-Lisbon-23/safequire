'use client'
import { Inter } from 'next/font/google'
import './globals.css'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { goerli } from 'wagmi/chains'

// 1. Get projectId
const projectId = '4fdd0a5e15551ede974799fb687cb3a6'

const chains = [goerli]


const inter = Inter({ subsets: ['latin'] })

const metadata = {
  title: 'Nata Finance',
  description: 'Merger and Aquistion Platform for the DeFi Space'
}

// 3. Create modal
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })
createWeb3Modal({ wagmiConfig, projectId, chains })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <WagmiConfig config={wagmiConfig}>
        <body className={inter.className}>{children}</body>
      </WagmiConfig>
    </html>
  )
}
