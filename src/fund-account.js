import xrpl from 'xrpl'

async function fundAccount() {
  /** @dev Connect to Testnet */
  const SERVER_URL = 'wss://s.altnet.rippletest.net:51233/'
  const client = new xrpl.Client(SERVER_URL)
  await client.connect()
  console.log('Connected to Testnet')

  /** @dev Create and fund wallet */
  try {
    console.log('\nCreating a new wallet and funding it with Testnet XRP...')
    // Max faucet limit: 100
    const options = { amount: '100' }
    const { wallet, balance } = await client.fundWallet(null, options)
    const new_wallet = wallet
    console.log(`Wallet: ${new_wallet.address}`)
    console.log(`Balance: ${balance}`)
    console.log('Account Testnet Explorer URL:')
    console.log(`  https://testnet.xrpl.org/accounts/${new_wallet.address}`)

    /** @dev Create wallet */
    // It is invalid until we send XRP to it!
    const incomplete_wallet = xrpl.Wallet.generate()
    console.log(`Incomplete Wallet Address: ${incomplete_wallet.address}`)

    /** @dev Create wallet using seed words */
    // const seed_wallet = xrpl.Wallet.fromSeed("your-seed-key")

    /** @dev Get account info from the ledger */
    console.log('\nGetting account info...')
    const response = await client.request({
      command: 'account_info',
      account: new_wallet.address,
      ledger_index: 'validated',
    })
    console.log(JSON.stringify(response, null, 2))

    /** @dev Listen to ledger close events */
    console.log('\nListening for ledger close events...')
    client.request({
      command: 'subscribe',
      streams: ['ledger'],
    })
    client.on('ledgerClosed', async (ledger) => {
      console.log(
        `Ledger #${ledger.ledger_index} validated ` +
          `with ${ledger.txn_count} transactions!`,
      )
    })

    /** @dev Disconnect */
    // Delay this by 10 seconds to give the ledger event listener time to receive and display some ledger events.
    setTimeout(async () => {
      await client.disconnect()
      console.log('\nDisconnected')
    }, 10000)
  } catch (error) {
    console.log(`Error ocurred: ${error}`)
    console.log(`Disconnecting...`)
    await client.disconnect()
    console.log(`Disconnected`)
  }
}

fundAccount().catch(console.error)
