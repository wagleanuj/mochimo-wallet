import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRecentActivity } from '../../../src/network/activity';

// Mock NetworkProvider
const mockNetwork = {
  searchTransactionsByAddress: vi.fn(),
  getMempoolTransactions: vi.fn(),
};
vi.mock('../../../src/redux/context/NetworkContext', () => ({
  NetworkProvider: {
    getNetwork: () => mockNetwork,
  },
}));

describe('fetchRecentActivity', () => {
  beforeEach(() => {
    mockNetwork.searchTransactionsByAddress.mockReset();
    mockNetwork.getMempoolTransactions.mockReset();
  });

  it('returns empty array if no transactions', async () => {
    mockNetwork.searchTransactionsByAddress.mockResolvedValue({ transactions: [] });
    mockNetwork.getMempoolTransactions.mockResolvedValue({ transactions: [] });
    const account = { tag: 'abc', name: 'Test', type: 'standard' as const, balance: '0', wotsIndex: 0, seed: '', order: 0, source: 'mnemonic' as const, faddress: '0xabc', index: 0 };
    const txs = await fetchRecentActivity(account);
    expect(Array.isArray(txs)).toBe(true);
    expect(txs.length).toBe(0);
  });

  it('parses confirmed send/receive transactions', async () => {
    mockNetwork.searchTransactionsByAddress.mockResolvedValue({
      transactions: [
        {
          transaction_identifier: { hash: 'tx1' },
          block_identifier: { index: 1 },
          timestamp: 1234567890,
          metadata: { fee_total: '10' },
          operations: [
            { type: 'SOURCE_TRANSFER', account: { address: '0xabc' }, amount: { value: '100' } },
            { type: 'DESTINATION_TRANSFER', account: { address: '0xdef' }, amount: { value: '100' }, metadata: { memo: 'test' } },
          ],
        },
      ],
    });
    mockNetwork.getMempoolTransactions.mockResolvedValue({ transactions: [] });
    const account = { tag: 'abc', name: 'Test', type: 'standard' as const, balance: '0', wotsIndex: 0, seed: '', order: 0, source: 'mnemonic' as const, faddress: '0xabc', index: 0 };
    const txs = await fetchRecentActivity(account);
    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].type).toBe('send');
    expect(txs[0].amount).toBe('100');
    expect(txs[0].memo).toBe('test');
  });

  it('parses mempool transactions', async () => {
    mockNetwork.searchTransactionsByAddress.mockResolvedValue({ transactions: [] });
    mockNetwork.getMempoolTransactions.mockResolvedValue({
      transactions: [
        {
          transaction_identifier: { hash: 'tx2' },
          timestamp: 1234567891,
          operations: [
            { type: 'SOURCE_TRANSFER', account: { address: '0xabc' }, amount: { value: '200' } },
            { type: 'DESTINATION_TRANSFER', account: { address: '0xdef' }, amount: { value: '200' } },
          ],
        },
      ],
    });
    const account = { tag: 'abc', name: 'Test', type: 'standard' as const, balance: '0', wotsIndex: 0, seed: '', order: 0, source: 'mnemonic' as const, faddress: '0xabc', index: 0 };
    const txs = await fetchRecentActivity(account);
    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].pending).toBe(true);
    expect(txs[0].type).toBe('send');
    expect(txs[0].amount).toBe('200');
  });

});
