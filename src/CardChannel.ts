import type { APDUCommand } from 'keycard-sdk/dist/apdu-command';
import { APDUResponse } from 'keycard-sdk/dist/apdu-response';
import type { CardChannel } from 'keycard-sdk/dist/card-channel';
import { CardIOError } from 'keycard-sdk/dist/apdu-exception';
import Keycard from './NativeKeycard';
import { Buffer } from 'buffer';

const TAG_LOST_CODE = 'KEYCARD_TAG_LOST';
const CARD_IO_PREFIX = 'CardIO Error: ';

export class NFCCardChannel implements CardChannel {
  async send(cmd: APDUCommand): Promise<APDUResponse> {
    let apduCmd = Buffer.from(cmd.serialize()).toString('hex');

    try {
      const apduResp = await Keycard.send(apduCmd);
      if (apduResp.state === 'error') {
        throw new Error('Error sending command');
      }

      return new APDUResponse(
        new Uint8Array(Buffer.from(apduResp.data, 'hex'))
      );
    } catch (err: any) {
      // anything failing here is the link, not the card rejecting the command
      throw new CardIOError(err);
    }
  }

  // a failed send() means the card stopped answering: recoverable by re-tapping
  static isCardLost(err: unknown): boolean {
    // instanceof misses it: keycard-sdk re-throws our error inside a KManagerError, keeping only its text
    const e = err as { code?: string; message?: string } | null;

    return e?.code === TAG_LOST_CODE || (e?.message ?? '').includes(CARD_IO_PREFIX);
  }

  isConnected(): boolean {
    return Keycard.isKeycardConnected();
  }
}
