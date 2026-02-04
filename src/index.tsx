/* eslint-disable prettier/prettier */
import Keycard from './NativeKeycard';
import { NFCCardChannel } from './card-channel';

export async function isNFCSupported(): Promise<boolean> {
  return await Keycard.isNFCSupported();
}

export async function isNFCEnabled(): Promise<boolean> {
  return await Keycard.isNFCEnabled();
}

export async function openNFCSettings(): Promise<boolean> {
  return await Keycard.openNFCSettings();
}

export async function startNFC(prompt: string): Promise<boolean> {
  return await Keycard.startNFC(prompt);
}

export async function stopNFC(): Promise<boolean> {
  return await Keycard.stopNFC();
}

export function startNFCChannel(): NFCCardChannel {
  return new NFCCardChannel();
}

export function getCardChannel(): NFCCardChannel {
  return new NFCCardChannel();
}
