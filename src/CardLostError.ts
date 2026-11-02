import { CardIOError } from 'keycard-sdk/dist/apdu-exception';

const TAG_LOST = 'Tag was lost.';
const TAG_LOST_CODE = 'KEYCARD_TAG_LOST';
const CARD_IO_PREFIX = 'CardIO Error: ';

/** The card stopped answering: moved out of range or the link died. Recoverable by re-tapping. */
export class CardLostError extends CardIOError {
  constructor(err: unknown) {
    super(err instanceof Error ? err : new Error(String(err)));
    this.name = 'CardLostError';
  }

  // keycard-sdk re-throws channel errors as its own KManagerError, so instanceof alone misses them
  static is(err: unknown): boolean {
    const e = err as { name?: string; code?: string } | null;
    const message = typeof err === 'string' ? err : (err as Error | null)?.message ?? '';

    return (
      e?.name === 'CardLostError' ||
      e?.code === TAG_LOST_CODE ||
      message.includes(TAG_LOST) ||
      message.includes(CARD_IO_PREFIX)
    );
  }
}
