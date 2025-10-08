import { useEffect, useState } from 'react';
import { Account } from '../types/account';
import { NetworkProvider } from '../redux/context/NetworkContext';

export interface WalletTransaction {
  type: 'send' | 'receive' | 'mining';
  amount: string;
  timestamp: number;
  address: string;
  txid?: string;
  blockNumber?: number;
  pending?: boolean;
  fee?: string;
  memo?: string;
}

/**
 * Fetches and normalizes all recent transactions for an account (confirmed and mempool).
 * Returns a ready-to-use array of WalletTransaction for UI.
 */
export async function fetchRecentActivity(account: Account): Promise<WalletTransaction[]> {
  const network = NetworkProvider.getNetwork();
  const currentAddress = '0x' + account.tag;
  let sendReceiveTxs: WalletTransaction[] = [];
  let miningTxs: WalletTransaction[] = [];
  let mempoolTxs: WalletTransaction[] = [];
  let feeByBlock: Record<string, { fee: bigint, timestamp: number, blockNumber: number }> = {};

  // --- CONFIRMED TRANSACTIONS ---
  try {
    const txResult = await network.searchTransactionsByAddress(currentAddress, { limit: 20 });
    if (txResult && Array.isArray(txResult.transactions)) {
      for (const tx of txResult.transactions) {
        if (!tx.transaction_identifier?.hash || !tx.operations || !tx.block_identifier?.index) continue;
        const blockId = tx.block_identifier?.index.toString();
        const blockNumber = tx.block_identifier?.index;
        const timestamp = tx.timestamp || Date.now();
        let feeTotal = BigInt(0);
        if (tx.metadata && tx.metadata.fee_total) feeTotal = BigInt(tx.metadata.fee_total);
        // SEND
        const sendOps = tx.operations.filter((op: any) =>
          (op.type === 'SOURCE_TRANSFER') &&
          op.account?.address?.toLowerCase() === currentAddress.toLowerCase()
        );
        for (const sendOp of sendOps) {
          const senderAddress = sendOp.account?.address?.toLowerCase();
          const destOps = tx.operations.filter((op: any) =>
            op.type === 'DESTINATION_TRANSFER' &&
            op.account?.address?.toLowerCase() !== senderAddress
          );
          const feePerDest = destOps.length > 0 ? (feeTotal / BigInt(destOps.length)) : BigInt(0);
          for (const destOp of destOps) {
            sendReceiveTxs.push({
              type: 'send',
              amount: destOp.amount?.value || '0',
              timestamp,
              address: destOp.account?.address,
              txid: tx.transaction_identifier?.hash,
              blockNumber,
              pending: false,
              fee: feePerDest.toString(),
              memo: destOp.metadata?.memo
            });
          }
        }
        // RECEIVE
        const recvOps = tx.operations.filter((op: any) =>
          (op.type === 'DESTINATION_TRANSFER') &&
          op.account?.address?.toLowerCase() === currentAddress.toLowerCase()
        );
        for (const recvOp of recvOps) {
          const sourceOp = tx.operations.find((op: any) => op.type === 'SOURCE_TRANSFER');
          if (sourceOp && sourceOp.account?.address?.toLowerCase() !== currentAddress.toLowerCase()) {
            sendReceiveTxs.push({
              type: 'receive',
              amount: recvOp.amount?.value || '0',
              timestamp,
              address: sourceOp ? sourceOp.account?.address : 'Unknown',
              txid: tx.transaction_identifier?.hash,
              blockNumber,
              memo: recvOp.metadata?.memo
            });
          }
        }
      }
    }
  } catch (error) {
    // Silently fail, UI will show empty
  }

  // --- MEMPOOL TRANSACTIONS ---
  try {
    const mempoolRes = await network.getMempoolTransactions();
    if (mempoolRes && Array.isArray(mempoolRes.transactions)) {
      for (const tx of mempoolRes.transactions) {
        if (!tx.transaction_identifier?.hash || !tx.operations) continue;
        const timestamp = tx.timestamp || Date.now();
        const txid = tx.transaction_identifier?.hash;
        const hasRelevantOps = tx.operations.some((op: any) =>
          op.account?.address?.toLowerCase() === currentAddress.toLowerCase()
        );
        if (!hasRelevantOps) continue;
        // Outgoing
        const sendOps = tx.operations.filter((op: any) =>
          (op.type === 'SOURCE_TRANSFER') &&
          op.account?.address?.toLowerCase() === currentAddress.toLowerCase()
        );
        for (const sendOp of sendOps) {
          const destOps = tx.operations.filter((op: any) =>
            op.type === 'DESTINATION_TRANSFER' &&
            op.account?.address?.toLowerCase() !== currentAddress.toLowerCase()
          );
          for (const destOp of destOps) {
            mempoolTxs.push({
              type: 'send',
              amount: destOp.amount?.value || '0',
              timestamp,
              address: destOp.account?.address,
              txid,
              pending: true
            });
          }
        }
        // Incoming
        const recvOps = tx.operations.filter((op: any) =>
          (op.type === 'DESTINATION_TRANSFER') &&
          op.account?.address?.toLowerCase() === currentAddress.toLowerCase()
        );
        for (const recvOp of recvOps) {
          const sourceOp = tx.operations.find((op: any) => op.type === 'SOURCE_TRANSFER');
          if (sourceOp && sourceOp.account?.address?.toLowerCase() !== currentAddress.toLowerCase()) {
            mempoolTxs.push({
              type: 'receive',
              amount: recvOp.amount?.value || '0',
              timestamp,
              address: sourceOp ? sourceOp.account?.address : 'Unknown',
              txid,
              pending: true
            });
          }
        }
      }
    }
  } catch (error) {
    // Silently fail, UI will show empty
  }

  // --- SORT AND RETURN ---
  const allTxs = [...sendReceiveTxs, ...miningTxs, ...mempoolTxs];
  allTxs.sort((a, b) => b.timestamp - a.timestamp);
  return allTxs;
}

/**
 * React hook to get recent activity for an account.
 * Returns { transactions, loading, refresh }
 */
export function useRecentActivity(account: Account) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setTransactions(await fetchRecentActivity(account));
    setLoading(false);
  };

  useEffect(() => {
    if (!account?.tag) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account?.tag]);

  return { transactions, loading, refresh };
}
