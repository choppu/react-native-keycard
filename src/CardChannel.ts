import type { APDUCommand } from 'keycard-sdk/dist/apdu-command';
import { APDUResponse } from 'keycard-sdk/dist/apdu-response';
import type { CardChannel } from 'keycard-sdk/dist/card-channel';
import { CardIOError } from 'keycard-sdk/dist/apdu-exception';
import Keycard from './NativeKeycard';
import { Buffer } from 'buffer';

export class NFCCardChannel implements CardChannel {
  async send(cmd: APDUCommand): Promise<APDUResponse> {
    let apduCmd = Buffer.from(cmd.serialize()).toString('hex');
    let respData: Buffer;

    try {
      const apduResp = await Keycard.send(apduCmd);
      if (apduResp.state === 'error') {
        throw new Error('Error sending command');
      }

      respData = Buffer.from(apduResp.data, 'hex');
    } catch (err: any) {
      throw new CardIOError(err);
    }

    return new APDUResponse(new Uint8Array(respData));
  }

  isConnected(): boolean {
    return Keycard.isKeycardConnected();
  }
}
