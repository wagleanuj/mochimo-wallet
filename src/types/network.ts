/**
 * Network node information
 */
export interface NetworkNode {
    host: string;
    port: number;
    updateTime: string;
    // Add other node fields as needed
}

/**
 * Response from tag resolution
 */
export interface TagResolveResponse {
    success: boolean;
    unanimous: boolean;
    addressConsensus: string;
    balanceConsensus: string;
    quorum: Array<{
        node: NetworkNode;
        address: string;
        balance: string;
    }>;
}

/**
 * Response from transaction push
 */
export interface TransactionResponse {
    status: 'success' | 'error'
    data?: {
      sent: number
      txid: string
    }
    error?: string
  }

/**
 * Response from tag activation
 */
export interface TagActivationResponse {
    status: 'success' | 'error';
    message: string;
    data?: {
        txid?: string;
        amount?: string;
    };
}

/**
 * Network service interface
 */
export interface NetworkService {
    apiUrl: string;
    resolveTag(tag: string): Promise<TagResolveResponse>;
    pushTransaction(transaction: string, recipients?: number): Promise<TransactionResponse>;
    activateTag(wotsAddress: string): Promise<TagActivationResponse>;
    getNetworkStatus(): Promise<{
        height: number;
        nodes: NetworkNode[];
    }>;
    getBalance(tag: string): Promise<string>;

    // Nuove funzioni MochimoApiClient
    getAccountBalance(address: string): Promise<any>;
    getMempoolTransactions(): Promise<any>;
    getMempoolTransaction(txHash: string): Promise<any>;
    waitForTransaction(transactionHash: string, timeout?: number, interval?: number): Promise<any>;
    getNetworkOptions(): Promise<any>;
    getBlock(identifier: any): Promise<{ block: any }>;
    getBlockTransaction(blockIdentifier: any, transactionHash: string): Promise<any>;
    submit(signedTransaction: string): Promise<any>;
    derive(publicKey: string, tag: string): Promise<any>;
    preprocess(operations: any[], metadata: any): Promise<any>;
    metadata(options: any, publicKeys: any[]): Promise<any>;
    payloads(operations: any[], metadata: any, publicKeys: any[]): Promise<any>;
    combine(unsignedTransaction: string, signatures: any[]): Promise<any>;
    parse(transaction: string, signed: boolean): Promise<any>;
    searchTransactionsByAddress(address: string, options?: {
        limit?: number;
        offset?: number;
        max_block?: number;
        status?: string;
    }): Promise<any>;
    searchTransactionsByBlock(blockIdentifier: any, options?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<any>;
    searchTransactionsByTxId(transactionHash: string, options?: {
        max_block?: number;
        status?: string;
    }): Promise<any>;
    getEventsBlocks(options?: {
        limit?: number;
        offset?: number;
    }): Promise<any>;
    getStatsRichlist(options?: {
        ascending?: boolean;
        offset?: number;
        limit?: number;
    }): Promise<any>;
}
export interface NetworkState {
    blockHeight: number;
    isConnected: boolean;
    error: string | null;
}