import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as endpoints from '../../../src/network/endpoints';

// Mock StorageProvider
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
vi.mock('../../../src/redux/context/StorageContext', () => ({
  StorageProvider: {
    getStorage: () => mockStorage,
  },
}));

describe('endpoints', () => {
  beforeEach(() => {
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
  });

  it('should return default endpoint if nothing is saved', async () => {
    mockStorage.getItem.mockResolvedValue(undefined);
    const ep = await endpoints.getCurrentApiEndpoint();
    expect(ep).toBe(endpoints.getApiEndpoints()[0].url);
  });

  it('should return saved endpoint if present', async () => {
    mockStorage.getItem.mockResolvedValue('https://custom.example');
    const ep = await endpoints.getCurrentApiEndpoint();
    expect(ep).toBe('https://custom.example');
  });

  it('should save endpoint if valid', async () => {
    mockStorage.setItem.mockResolvedValue(undefined);
    const ok = await endpoints.setApiEndpoint('https://api.mochimo.org');
    expect(ok).toBe(true);
    expect(mockStorage.setItem).toHaveBeenCalledWith('api-endpoint', 'https://api.mochimo.org');
  });

  it('should not save endpoint if invalid', async () => {
    const ok = await endpoints.setApiEndpoint('not-a-url');
    expect(ok).toBe(false);
    expect(mockStorage.setItem).not.toHaveBeenCalled();
  });

  it('should validate endpoints correctly', () => {
    expect(endpoints.validateApiEndpoint('https://api.mochimo.org')).toBe(true);
    expect(endpoints.validateApiEndpoint('http://api.mochimo.org')).toBe(true);
    expect(endpoints.validateApiEndpoint('custom')).toBe(true);
    expect(endpoints.validateApiEndpoint('ftp://api.mochimo.org')).toBe(false);
    expect(endpoints.validateApiEndpoint('not-a-url')).toBe(false);
  });
});
