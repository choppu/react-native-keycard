jest.mock('../NativeKeycard', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({ set: jest.fn(), getString: jest.fn(), remove: jest.fn() }),
}));

import RNKeycard from '../index';

describe('RNKeycard', () => {
  it('exports the expected surface', () => {
    expect(RNKeycard.Core).toBeDefined();
    expect(RNKeycard.NFCCardChannel).toBeDefined();
    expect(RNKeycard.CardLostError).toBeDefined();
    expect(RNKeycard.PairingStorage).toBeDefined();
    expect(RNKeycard.WhitelistedPubKeysStorage).toBeDefined();
  });
});
