declare interface walletSendTransactionParams {
  to: string;
  value: number;
}

declare interface requestArgs {
  method: string;
  params: any[] | walletSendTransactionParams[];
}
declare global {
  interface Window {
    bitcoin:any;
  }
}

export default interface WindowBitcoinProvider {
  request(args:requestArgs): Promise<any>;
  enable(): Promise<any>;
}
