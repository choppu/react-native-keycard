import { CardIOError } from 'keycard-sdk/dist/apdu-exception';
import { NFCCardChannel } from '../CardChannel';

const mockSend = jest.fn();

jest.mock('../NativeKeycard', () => ({
  __esModule: true,
  default: {
    send: (apdu: string) => mockSend(apdu),
  },
}));

const TAG_LOST = 'Tag was lost.';

// a second copy of keycard-sdk in the bundle: same shape, different class identity
class ForeignCardIOError extends Error {
  constructor(err: Error) {
    super('CardIO Error: ' + err);
    this.name = 'CardIOError';
  }
}

const cmd = {
  serialize: () => new Uint8Array([0x00, 0xa4, 0x04, 0x00]),
} as any;

const channel = new NFCCardChannel();

describe('NFCCardChannel.send', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('returns an APDUResponse for a valid payload', async () => {
    mockSend.mockResolvedValue({ state: 'success', data: '9000' });
    const resp = await channel.send(cmd);
    expect(resp.sw).toBe(0x9000);
  });

  it('wraps a tag-loss rejection as a retryable CardIOError', async () => {
    mockSend.mockRejectedValue(Object.assign(new Error(TAG_LOST), { code: 'KEYCARD_TAG_LOST' }));

    await expect(channel.send(cmd)).rejects.toThrow(CardIOError);
    await expect(channel.send(cmd)).rejects.toThrow(/Tag was lost\./);
  });

  it('wraps a resolved error state as the generic channel error', async () => {
    mockSend.mockResolvedValue({ state: 'error', data: '' });
    await expect(channel.send(cmd)).rejects.toThrow(
      /CardIO Error: .*Error sending command/
    );
  });

  it('wraps a truncated success payload instead of letting it escape bare', async () => {
    mockSend.mockResolvedValue({ state: 'success', data: '90' });
    await expect(channel.send(cmd)).rejects.toThrow(
      /CardIO Error: .*at least 2 bytes/
    );
  });
});

describe('NFCCardChannel.isCardLost', () => {
  it('recognizes a native tag-loss rejection', () => {
    expect(NFCCardChannel.isCardLost(Object.assign(new Error('NativeError'), { code: 'KEYCARD_TAG_LOST' }))).toBe(true);
  });

  it('recognizes an error re-thrown by keycard-sdk', async () => {
    mockSend.mockRejectedValue(new Error(TAG_LOST));
    const err = await channel.send(cmd).catch((e) => e);

    expect(NFCCardChannel.isCardLost(new Error(`Error opening secure channel. ${err}`))).toBe(true);
  });

  it('recognizes a foreign CardIOError', () => {
    expect(NFCCardChannel.isCardLost(new ForeignCardIOError(new Error('boom')))).toBe(true);
  });

  it('returns false for unrelated errors and empty values', () => {
    expect(NFCCardChannel.isCardLost(new Error(TAG_LOST))).toBe(false);
    expect(NFCCardChannel.isCardLost(new Error('boom'))).toBe(false);
    expect(NFCCardChannel.isCardLost(null)).toBe(false);
    expect(NFCCardChannel.isCardLost(undefined)).toBe(false);
  });
});
