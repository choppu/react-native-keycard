import { CardIOError } from 'keycard-sdk/dist/apdu-exception';
import { CardLostError } from '../CardLostError';

const TAG_LOST = 'Tag was lost.';

// a second copy of keycard-sdk in the bundle: same shape, different class identity
class ForeignCardIOError extends Error {
  constructor(err: Error) {
    super('CardIO Error: ' + err);
    this.name = 'CardIOError';
  }
}

describe('CardLostError', () => {
  it('stays a CardIOError so keycard-sdk keeps a stored pairing', () => {
    expect(new CardLostError(new Error(TAG_LOST))).toBeInstanceOf(CardIOError);
  });

  it('keeps the wrapped message', () => {
    expect(new CardLostError(new Error(TAG_LOST)).message).toContain(TAG_LOST);
  });

  it('recognizes itself', () => {
    expect(CardLostError.is(new CardLostError(new Error('boom')))).toBe(true);
  });

  it('recognizes a native tag-loss rejection', () => {
    expect(CardLostError.is(new Error(TAG_LOST))).toBe(true);
    expect(CardLostError.is(Object.assign(new Error('NativeError'), { code: 'KEYCARD_TAG_LOST' }))).toBe(true);
  });

  it('recognizes an error re-thrown by keycard-sdk', () => {
    expect(CardLostError.is(new Error(`Error opening secure channel. ${new CardLostError(new Error(TAG_LOST))}`))).toBe(true);
  });

  it('recognizes a foreign CardIOError', () => {
    expect(CardLostError.is(new ForeignCardIOError(new Error('boom')))).toBe(true);
  });

  it('returns false for unrelated errors and empty values', () => {
    expect(CardLostError.is(new Error('boom'))).toBe(false);
    expect(CardLostError.is(null)).toBe(false);
    expect(CardLostError.is(undefined)).toBe(false);
  });
});
