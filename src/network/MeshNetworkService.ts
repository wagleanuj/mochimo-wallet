import { NetworkService, TagActivationResponse, TagResolveResponse, TransactionResponse } from "../types/network";
import { BaseNetworkService } from "./BaseNetworkService";
import { MochimoApiClient } from "mochimo-mesh-api-client";
export class MeshNetworkService implements NetworkService {
    public apiUrl: string;
    private apiClient: MochimoApiClient;
    
    getNetworkStatus(): Promise<{ height: number; nodes: any[]; }> {
        return this.apiClient.getNetworkStatus().then(res=>{
            return {
                height: parseInt(res?.current_block_identifier?.index?.toString() ?? '0'),
                nodes: []
            }
        })
    }

    getAccountBalance(address: string): Promise<any> {
        const addr = address.startsWith('0x') ? address : '0x' + address.slice(0, 40);
        return this.apiClient.getAccountBalance(addr);
    }
    getMempoolTransactions(): Promise<any> {
        return this.apiClient.getMempoolTransactions();
    }
    getMempoolTransaction(txHash: string): Promise<any> {
        return this.apiClient.getMempoolTransaction(txHash);
    }
    waitForTransaction(transactionHash: string, timeout?: number, interval?: number): Promise<any> {
        return this.apiClient.waitForTransaction(transactionHash, timeout, interval);
    }
    getNetworkOptions(): Promise<any> {
        return this.apiClient.getNetworkOptions();
    }
    getBlock(identifier: any): Promise<{ block: any }> {
        return this.apiClient.getBlock(identifier);
    }
    getBlockTransaction(blockIdentifier: any, transactionHash: string): Promise<any> {
        return this.apiClient.getBlockTransaction(blockIdentifier, transactionHash);
    }
    submit(signedTransaction: string): Promise<any> {
        return this.apiClient.submit(signedTransaction);
    }
    derive(publicKey: string, tag: string): Promise<any> {
        return this.apiClient.derive(publicKey, tag);
    }
    preprocess(operations: any[], metadata: any): Promise<any> {
        return this.apiClient.preprocess(operations, metadata);
    }
    metadata(options: any, publicKeys: any[]): Promise<any> {
        return this.apiClient.metadata(options, publicKeys);
    }
    payloads(operations: any[], metadata: any, publicKeys: any[]): Promise<any> {
        return this.apiClient.payloads(operations, metadata, publicKeys);
    }
    combine(unsignedTransaction: string, signatures: any[]): Promise<any> {
        return this.apiClient.combine(unsignedTransaction, signatures);
    }
    parse(transaction: string, signed: boolean): Promise<any> {
        return this.apiClient.parse(transaction, signed);
    }
    searchTransactionsByAddress(address: string, options?: {
        limit?: number;
        offset?: number;
        max_block?: number;
        status?: string;
    }): Promise<any> {
        // Forza address a 0x + 40 caratteri
        const addr = address.startsWith('0x') ? address : '0x' + address.slice(0, 40);
        return this.apiClient.searchTransactionsByAddress(addr, options);
    }
    searchTransactionsByBlock(blockIdentifier: any, options?: {
        limit?: number;
        offset?: number;
        status?: string;
    }): Promise<any> {
        return this.apiClient.searchTransactionsByBlock(blockIdentifier, options);
    }
    searchTransactionsByTxId(transactionHash: string, options?: {
        max_block?: number;
        status?: string;
    }): Promise<any> {
        return this.apiClient.searchTransactionsByTxId(transactionHash, options);
    }
    getEventsBlocks(options?: {
        limit?: number;
        offset?: number;
    }): Promise<any> {
        return this.apiClient.getEventsBlocks(options);
    }
    getStatsRichlist(options?: {
        ascending?: boolean;
        offset?: number;
        limit?: number;
    }): Promise<any> {
        return this.apiClient.getStatsRichlist(options);
    }
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.apiClient = new MochimoApiClient(apiUrl);
    }
    getBalance(tag: string): Promise<string> {
        // tag è un tag, non un address, quindi va risolto altrove
        return this.apiClient.getAccountBalance(tag.startsWith('0x') ? tag : '0x' + tag).then(res=>{
            return res.balances[0].value
        }).catch(err=>{
            if(err.message.includes('Account not found')){
                return '0'
            }
            throw err
        })
    }

    resolveTag(tag: string): Promise<TagResolveResponse> {
        const tagHex = tag.startsWith('0x') ? tag : '0x' + tag;
        return this.apiClient.resolveTag(tagHex).then(res => {
            return {
                success: true,
                unanimous: true,
                addressConsensus: res.result.address,
                balanceConsensus: res.result.amount,
                quorum: []
            }
        })
    }

    async pushTransaction(transaction: string, recipients?: number): Promise<TransactionResponse> {
        try {
            const result = await this.apiClient.submit(transaction)
            return {
                status: 'success',
                data: {
                    sent: 0,
                    txid: result.transaction_identifier.hash,
                },
            }
        } catch (err) {
            return {
                status: 'error',
                error: 'Could not submit transaction'
            }
        }
    }

    activateTag(wotsAddress: string): Promise<TagActivationResponse> {
        return Promise.resolve({ status: 'success', data: { txid: '',amount: '' }, message: 'Successfully activated tag' })
    }

}