import type { APDUCommand } from 'keycard-sdk/dist/apdu-command';
import { APDUResponse } from 'keycard-sdk/dist/apdu-response';
import type { CardChannel } from 'keycard-sdk/dist/card-channel';
import { CardIOError } from 'keycard-sdk/dist/apdu-exception';
import Keycard from './NativeKeycard';
import { Buffer } from 'buffer';

export class NFCCardChannel implements CardChannel {
  async send(cmd: APDUCommand): Promise<APDUResponse> {
    let apduCmd = Buffer.from(cmd.serialize()).toString('hex');

    try {
      const apduResp = await Keycard.send(apduCmd);
      if (apduResp.state === 'error') {
        throw new Error('Error sending command');
      }

      // Constructed inside the try: APDUResponse's own "must be at least 2
      // bytes" throw previously escaped un-wrapped, so callers saw it bare
      // instead of as a CardIOError like every other channel failure.
      return new APDUResponse(
        new Uint8Array(Buffer.from(apduResp.data, 'hex'))
      );
    } catch (err: any) {
      throw new CardIOError(err);
    }
  }

  isConnected(): boolean {
    return Keycard.isKeycardConnected();
  }
}
