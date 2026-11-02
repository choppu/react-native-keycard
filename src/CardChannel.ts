import type { APDUCommand } from 'keycard-sdk/dist/apdu-command';
import { APDUResponse } from 'keycard-sdk/dist/apdu-response';
import type { CardChannel } from 'keycard-sdk/dist/card-channel';
import Keycard from './NativeKeycard';
import { CardLostError } from './CardLostError';
import { Buffer } from 'buffer';

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
      throw new CardLostError(err);
    }
  }

  isConnected(): boolean {
    return Keycard.isKeycardConnected();
  }
}
