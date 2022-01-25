<template>
  <div class="home">
    <span>Derivation Path</span>
    <input type="text" v-model="path">
    <button @click="getAddress">Get Address</button>
    <br>
    <span>Addresses</span>
    <br>
    <div v-for="addr in addresses" v-bind:key="addr.address">
      <span>Address: </span>
      <span>{{addr.address}}</span>
      <br>
      <span>Public Key: </span>
      <span>{{addr.publicKey}}</span>
      <br>
      <span>Derivation Path: </span>
      <span>{{addr.derivationPath}}</span>
      <br>
    </div>
    <br>
    <br>
    <br>
    <button @click="signMessage">Sign Message</button>
    <br>
    <span>Signed Message</span>
    <br>
    <span>
      {{signedMessage}}
    </span>
    <br>
    <br>
    <br>
    <button @click="signTx">send amount</button>
    <br>
    <span>txId</span>
    <br>
    <span>
      {{txId}}
    </span>
    <br>
    <br>
    <br>
    <button @click="signPsbt">send amount with psbt</button>
    <br>
    <span>txId</span>
    <br>
    <span>
      {{psbt}}
    </span>
    <br>
    <span>
      {{base64}}
    </span>
  </div>
</template>

<script lang="ts">

import { Options, Vue } from 'vue-class-component';
import * as bitcoin from 'bitcoinjs-lib';
import WindowBitcoinProvider from '@/utils/WindowBitcoinProvider';

declare global {
  interface Window {
    bitcoin:any;
  }
}

@Options({})
export default class Home extends Vue {
  addresses = {};

  path = ''

  bitcoinProvider!: WindowBitcoinProvider;

  signedMessage = '';

  txId = '';

  psbt = '';

  base64 = '';

  NETWORK = bitcoin.networks.testnet;

  getAddress(): void {
    this.bitcoinProvider.request({ method: 'wallet_getAddresses', params: [0, 5, true] })
      .then((addrs) => {
        this.addresses = addrs;
      });
  }

  signMessage(): void {
    this.bitcoinProvider.request({
      method: 'wallet_signMessage',
      params: [
        'This is just a message test for RSK',
        'tb1q8ctftawscgzak4h989ef9wrgfqen79vxfspkce',
      ],
    })
      .then((r) => {
        this.signedMessage = r;
      });
  }

  signTx(): void {
    this.bitcoinProvider.request(
      {
        method: 'wallet_sendTransaction',
        params: [{
          to: 'mi4BrsJBpLz3tAnvUnP6xCpPVLyatcHmhH',
          value: 10000,
        }],
      },
    )
      .then((r) => {
        this.txId = r;
      });
  }

  signPsbt():void {
    // eslint-disable-next-line max-len
    // const base64psbt = 'cHNidP8BAFICAAAAAQHXVg9bz8W7xt+5+yOc/NM6xrk+N4tb1L2CdVLigKzgAAAAAAAAAAAAAXEDAAAAAAAAFgAUsbcyrOY/QlKFQFEN8ZkvPLly9uZ0U7pfAAEBK+gDAAAAAAAAIgAgYMATVrZ9ycDwP+12tinUlLpL35Y0O3884Zm8MXPfZAIBBSAEdFO6X7F1dqkUsbcyrOY/QlKFQFEN8ZkvPLly9uaIrAAA';
    // const psbt = bitcoin.Psbt.fromBase64(base64psbt);
    // const data = Buffer.from('bitcoinjs-lib', 'utf8');
    // const embed = bitcoin.payments.embed({ data: [data] });
    // psbt.addOutput({
    //   script: embed.output!,
    //   value: 0,
    // });
    this.bitcoinProvider.request({
      method: 'wallet_signPSBT',
      params: [
        this.getPsbt(),
        0,
        'tb1q2rtgwcsmcqpzvm6mu36pnun0e2wt7zmkvk8a7c',
      ],
    }).then((psbt) => {
      this.psbt = psbt;
    })
      .catch(console.error);
  }

  // eslint-disable-next-line class-methods-use-this
  compressPublicKey(pk: string) {
    const { publicKey } = bitcoin.ECPair.fromPublicKey(Buffer.from(pk, 'hex'));
    return publicKey.toString('hex');
  }

  // eslint-disable-next-line class-methods-use-this
  getRedeem(pubkey: string) {
    const pair = bitcoin.ECPair.fromPublicKey(Buffer.from(pubkey, 'hex'));
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pair.publicKey, network: this.NETWORK });
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: this.NETWORK });
    return p2sh.redeem?.output;
  }

  // eslint-disable-next-line class-methods-use-this
  getPsbt(): string {
    const txId = 'a2aad544a171da71d123bac66e462b66473ab1764ae8de7d0f4b29265a8330e0';
    const psbt = new bitcoin.Psbt({ network: this.NETWORK });
    const previousTx = '020000000001011f9af633dd249054b4dc71a488b436b7214e1801eb5615b967a9152e793746fb0100000000000000000210270000000000001976a9141bd8787330a19c871240e5733fc01831f3786c3988acca2e01000000000016001450d687621bc002266f5be47419f26fca9cbf0b7602483045022100f860ce9c7c12773c7de027a7fd10e2f6e1ebbf073f5de2d578e7b9205e70e4b3022010499aca6d08db8dd66e7c19f17b8bcf51d105ca11f87ddb8d4b159839fa3a4f012102f48e7515190efb820add0eadace90f0b280beb7d449da6bcb18da39159659ef200000000';
    const utxo = bitcoin.Transaction.fromHex(previousTx);
    const index = 1;
    psbt.setVersion(2);
    psbt.addInput({
      hash: txId,
      index,
      witnessUtxo: {
        value: utxo.outs[index].value, // input.value,
        script: utxo.outs[index].script,
      },
      // nonWitnessUtxo: Buffer.from(previousTx, 'hex'),
    });
    psbt.addOutput({
      address: 'tb1q8ctftawscgzak4h989ef9wrgfqen79vxfspkce',
      value: 70000,
    });
    const data = Buffer.from('Op_return-test', 'utf8');
    const embed = bitcoin.payments.embed({ data: [data] });
    psbt.addOutput({
      script: embed.output!,
      value: 0,
    });
    psbt.setMaximumFeeRate(1000 * 1000 * 1000);
    console.log(psbt);
    const base64 = psbt.toBase64();
    this.base64 = base64;
    return base64;
  }

  created(): void {
    // this.getPsbt();
    const w = window as Window;
    try {
      if (w.bitcoin) {
        this.bitcoinProvider = window.bitcoin;
        this.bitcoinProvider.enable()
          .then((r:any) => {
            console.log('done');
            console.log(r);
          });
      }
    } catch (e) {
      console.error(e);
    }
  }
}
</script>
