import { NetworkService, TagResolveResponse, TransactionResponse, TagActivationResponse } from '../types/network';

export abstract class BaseNetworkService implements NetworkService {
    getBalance(tag: string): Promise<string> {
        throw new Error('Method not implemented.');
    }
    getAccountBalance(address: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getMempoolTransactions(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getMempoolTransaction(txHash: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    waitForTransaction(transactionHash: string, timeout?: number, interval?: number): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getNetworkOptions(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getBlock(identifier: any): Promise<{ block: any }> {
        throw new Error('Method not implemented.');
    }
    getBlockTransaction(blockIdentifier: any, transactionHash: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    submit(signedTransaction: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    derive(publicKey: string, tag: string): Promise<any> {
        throw new Error('Method not implemented.');
    }
    preprocess(operations: any[], metadata: any): Promise<any> {
        throw new Error('Method not implemented.');
    }
    metadata(options: any, publicKeys: any[]): Promise<any> {
        throw new Error('Method not implemented.');
    }
    payloads(operations: any[], metadata: any, publicKeys: any[]): Promise<any> {
        throw new Error('Method not implemented.');
    }
    combine(unsignedTransaction: string, signatures: any[]): Promise<any> {
        throw new Error('Method not implemented.');
    }
    parse(transaction: string, signed: boolean): Promise<any> {
        throw new Error('Method not implemented.');
    }
    searchTransactionsByAddress(address: string, options?: {
        limit?: number;
        offset?: number;
        max_block?: number;
        status?: string;
    }): Promise<any> {
        throw new Error('Method not implemented.');
    }
    searchTransactionsByBlock(blockIdentifier: any, options?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<any> {
        throw new Error('Method not implemented.');
    }
    searchTransactionsByTxId(transactionHash: string, options?: {
        max_block?: number;
        status?: string;
    }): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getEventsBlocks(options?: {
        limit?: number;
        offset?: number;
    }): Promise<any> {
        throw new Error('Method not implemented.');
    }
    getStatsRichlist(options?: {
        ascending?: boolean;
        offset?: number;
        limit?: number;
    }): Promise<any> {
        throw new Error('Method not implemented.');
    }
    public abstract apiUrl: string;

    async resolveTag(tag: string): Promise<TagResolveResponse> {
        throw new Error("Method not implemented.");
    }

    async pushTransaction(transaction: string, recipients?: number): Promise<TransactionResponse> {
       throw new Error("Method not implemented.");
    }

    async activateTag(wotsAddress: string): Promise<TagActivationResponse> {
        throw new Error("Method not implemented.");
    }

    abstract getNetworkStatus(): Promise<{ height: number; nodes: any[] }>;
} 