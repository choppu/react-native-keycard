import { NFCCardChannel } from '../CardChannel';

const mockSend = jest.fn();

jest.mock('../NativeKeycard', () => ({
  __esModule: true,
  default: {
    send: (apdu: string) => mockSend(apdu),
  },
}));

// Minimal APDU command: a bare SELECT-shaped payload is enough — the channel
// only serializes it to hex.
const cmd = {
  serialize: () => new Uint8Array([0x00, 0xa4, 0x04, 0x00]),
} as any;

describe('NFCCardChannel.send', () => {
  beforeEach(() => {
    mockSend.mockReset();
  });

  it('returns an APDUResponse for a valid payload', async () => {
    mockSend.mockResolvedValue({ state: 'success', data: '9000' });
    const resp = await new NFCCardChannel().send(cmd);
    expect(resp.sw).toBe(0x9000);
  });

  it('wraps a native tag-loss rejection as CardIOError carrying the message', async () => {
    // What Android rejects with after a mid-APDU tag removal.
    mockSend.mockRejectedValue(new Error('Tag was lost.'));
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(
      /CardIO Error: .*Tag was lost\./
    );
  });

  it('wraps an iOS tag-loss rejection the same way', async () => {
    mockSend.mockRejectedValue(new Error('NFCError:102'));
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(
      /CardIO Error: .*NFCError:102/
    );
  });

  it('wraps a resolved error state as the generic channel error', async () => {
    mockSend.mockResolvedValue({ state: 'error', data: '' });
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(
      /CardIO Error: .*Error sending command/
    );
  });

  it('wraps a truncated success payload instead of letting it escape bare', async () => {
    // Previously APDUResponse was constructed outside the try, so its own
    // "must be at least 2 bytes" throw reached callers unwrapped.
    mockSend.mockResolvedValue({ state: 'success', data: '90' });
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(
      /CardIO Error: .*at least 2 bytes/
    );
  });
});
