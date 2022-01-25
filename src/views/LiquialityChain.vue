<template>
  <div>
    <span>Chain Abstraction Layer</span>
    <button @click="getAddress">get address</button>
    <br>
    <button @click="signMessage">sign message</button>
    <br>
    <button @click="sendTx">send amount</button>

  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { Client } from '@liquality/client';
import { BitcoinRpcProvider } from '@liquality/bitcoin-rpc-provider';
import { BitcoinLedgerProvider } from '@liquality/bitcoin-ledger-provider';
import { BitcoinNetworks } from '@liquality/bitcoin-networks';
import { BitcoinNodeWalletProvider } from '@liquality/bitcoin-node-wallet-provider';
import { BigNumber } from 'bignumber.js';
import { Address, bitcoin } from '@liquality/types';

@Options({})
export default class LiquialityChain extends Vue {
  bitcoin!:Client;

  bitcoinAddress: any;

  async created() {
    this.bitcoin = new Client();
    const provider = new BitcoinRpcProvider(
      {
        uri: 'http://3.216.31.74:18030',
        username: 'rpc',
        password: 'rpc',
        network: BitcoinNetworks.bitcoin_testnet,
      },
    );
    const addr = await provider.getBalance(['tb1q2rtgwcsmcqpzvm6mu36pnun0e2wt7zmkvk8a7c']);
    console.log(addr);
    this.bitcoin.addProvider(provider);
    // const nodeWalletProvider = new BitcoinNodeWalletProvider({
    //   uri: 'https://liquality.io/bitcointestnetrpc',
    //   username: 'bitcoin',
    //   password: 'local321',
    //   network: BitcoinNetworks.bitcoin_testnet,
    // });
    // const address:Address = await nodeWalletProvider.getNewAddress(bitcoin.AddressType.BECH32);
    // console.log(address);
    // this.bitcoin.addProvider(new BitcoinLedgerProvider(
    //   { network: BitcoinNetworks.bitcoin_testnet },
    // ));
  }

  async sendTx() {
    // Send a transaction
    await this.bitcoin.chain.sendTransaction({
      to: 'tb1q8ctftawscgzak4h989ef9wrgfqen79vxfspkce',
      value: new BigNumber(70000),
    });
  }

  async getAddress() {
    // Fetch addresses from Ledger wallet using a single-unified API
    const [bitcoinAddress] = await this.bitcoin.wallet.getAddresses(0, 1);
    this.bitcoinAddress = bitcoinAddress;
  }

  async signMessage() {
    // Sign a message
    const signedMessageBitcoin = await this.bitcoin.wallet.signMessage(
      'The Times 3 January 2009 Chancellor on brink of second bailout for banks', 'tb1q8ctftawscgzak4h989ef9wrgfqen79vxfspkce',
    );
  }
}
</script>
