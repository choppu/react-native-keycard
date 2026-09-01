package com.keycard

import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.tech.IsoDep;
import android.os.SystemClock;
import android.util.Log;

import java.io.IOException;
import java.lang.SecurityException

import com.keycard.NFCCardChannel

/**
 * Manages connection of NFC-based cards. Extends Thread and must be started using the start() method. The thread has
 * a runloop which monitors the connection and from which CardListener callbacks are called.
 */
public class NFCCardManager(loopSleepMS: Long?): Thread(), NfcAdapter.ReaderCallback {
  private var isoDep: IsoDep? = null;
  private var isRunning: Boolean = false;
  private var loopSleepMS: Long = DEFAULT_LOOP_SLEEP_MS;
  private var cardListener: NFCCardChannel? = null;

  init {
    if(loopSleepMS != null) {
      this.loopSleepMS = loopSleepMS;
    }
  }

  /**
   * True if connected, false otherwise.
   * @return if connected, false otherwise
   */
  public fun isConnected(): Boolean {
    try {
      return this.isoDep != null && this.isoDep!!.isConnected();
    } catch (e: SecurityException) {
      return false;
    }
  }

  /**
   * Drops the current tag after a transceive-level loss.
   *
   * IsoDep.isConnected() reports a LOCAL flag, not the RF link: it keeps
   * returning true for a tag that has physically left the field, until the tag
   * is closed. Without this the runloop never sees a connected -> disconnected
   * transition, so no disconnect event is emitted AND a re-tap produces no
   * connect event either (the state never left "connected"), leaving the
   * reader deaf until the session is torn down.
   */
  public fun invalidateTag() {
    val dep: IsoDep? = this.isoDep;
    this.isoDep = null;

    try {
      dep?.close();
    } catch (e: IOException) {
      // Already gone — nothing to release.
    } catch (e: SecurityException) {
      // Tag owned by another activity — nothing to release.
    }
  }

  override fun onTagDiscovered(tag: Tag) {
    // Release any previous tag before adopting the new one, so a stale
    // reference can never keep the runloop's presence state stuck.
    this.invalidateTag();
    try {
      this.isoDep = IsoDep.get(tag);
      this.isoDep?.connect();
      // 10 s, not 120 s: a transceive against a half-coupled tag (lifted just
      // as it connected) blocks the full timeout with no TagLostException and
      // no disconnect transition — observed on-device as a 121 s freeze on
      // SELECT. No legitimate Keycard APDU takes anywhere near 10 s; on
      // timeout the transceive throws and the failure surfaces immediately.
      this.isoDep?.setTimeout(10000);
    } catch (e: IOException) {
      Log.e(TAG, "Error connecting to tag");
    } catch (e: SecurityException) {
      Log.e(TAG, "Error connecting to tag");
    }
  }

  /**
   * Runloop. Do NOT invoke directly. Use start() instead.
   */
  override fun run() {
    var connected: Boolean = this.isConnected();

    while (true) {
      val newConnected: Boolean = this.isConnected();
      if (newConnected != connected) {
        connected = newConnected;
        Log.i(TAG, "tag " + (if(connected) "connected" else "disconnected"));

        if (connected && !isRunning) {
          this.onCardConnected();
        } else {
          this.onCardDisconnected();
        }
      }

      SystemClock.sleep(loopSleepMS);
    }
  }

  /**
   * Reacts on card connected by calling the callback of the registered listener.
   */
  private fun onCardConnected() {
    this.isRunning = true;

    if (this.cardListener != null) {
      this.cardListener!!.onConnected(this.isoDep!!);
    }

    isRunning = false;
  }

  /**
   * Reacts on card disconnected by calling the callback of the registered listener.
   */
  private fun onCardDisconnected(): Unit {
    this.isRunning = false;
    isoDep = null;
    if (this.cardListener != null) {
      this.cardListener!!.onDisconnected();
    }
  }

  /**
   * Sets the card listener.
   *
   * @param listener the new listener
   */
  public fun setCardListener(listener: NFCCardChannel): Unit {
    this.cardListener = listener;
  }

  companion object {
    private var TAG: String = "NFCCardManager";
    private var DEFAULT_LOOP_SLEEP_MS: Long = 50;
  }
}
