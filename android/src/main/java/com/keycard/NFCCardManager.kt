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

  override fun onTagDiscovered(tag: Tag) {
    this.isoDep = IsoDep.get(tag);
    try {
      this.isoDep = IsoDep.get(tag);
      this.isoDep?.connect();
      this.isoDep?.setTimeout(120000);
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
