import { NFCCardChannel } from '../CardChannel';
import { CardLostError } from '../CardLostError';

const mockSend = jest.fn();

jest.mock('../NativeKeycard', () => ({
  __esModule: true,
  default: {
    send: (apdu: string) => mockSend(apdu),
  },
}));

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

  it('wraps a tag-loss rejection as a retryable CardLostError', async () => {
    mockSend.mockRejectedValue(
      Object.assign(new Error('Tag was lost.'), { code: 'KEYCARD_TAG_LOST' })
    );

    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(CardLostError);
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(/Tag was lost\./);
  });

  it('wraps a resolved error state as the generic channel error', async () => {
    mockSend.mockResolvedValue({ state: 'error', data: '' });
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(
      /CardIO Error: .*Error sending command/
    );
  });

  it('wraps a truncated success payload instead of letting it escape bare', async () => {
    mockSend.mockResolvedValue({ state: 'success', data: '90' });
    await expect(new NFCCardChannel().send(cmd)).rejects.toThrow(
      /CardIO Error: .*at least 2 bytes/
    );
  });
});
