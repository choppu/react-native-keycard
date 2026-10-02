package com.keycard

import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.os.SystemClock
import android.util.Log
import java.io.IOException

/**
 * Manages connection of NFC-based cards. Extends Thread and must be started using the start() method. The thread has
 * a runloop which monitors the connection and from which CardListener callbacks are called.
 */
class NFCCardManager(loopSleepMS: Long?) : Thread(), NfcAdapter.ReaderCallback {
  private var isoDep: IsoDep? = null
  @Volatile private var running = false
  private val lock = Any()
  private var loopSleepMS = DEFAULT_LOOP_SLEEP_MS
  private var cardListener: NFCCardChannel? = null

  init {
    if (loopSleepMS != null) {
      this.loopSleepMS = loopSleepMS
    }
  }

  /**
   * True if connected, false otherwise.
   * @return if connected, false otherwise
   */
  fun isConnected(): Boolean {
    return try {
      synchronized(lock) {
        val dep = isoDep
        dep != null && dep.isConnected()
      }
    } catch (e: SecurityException) {
      false
    }
  }

  // isConnected() stays true for a lost tag until it is closed
  fun invalidateTag() {
    val dep = synchronized(lock) {
      val current = isoDep
      isoDep = null
      current
    }
    try {
      dep?.close()
    } catch (e: Exception) {
      Log.e(TAG, "invalidateTag: " + e.message)
    }
  }

  override fun onTagDiscovered(tag: Tag) {
    invalidateTag()
    try {
      val dep = IsoDep.get(tag)
      dep.connect()
      // a half-coupled tag blocks transceive for the whole timeout
      dep.setTimeout(TRANSSCEIVE_TIMEOUT_MS)
      synchronized(lock) { isoDep = dep }
    } catch (e: Exception) {
      Log.e(TAG, "Error connecting to tag")
    }
  }

  /**
   * Runloop. Do NOT invoke directly. Use start() instead.
   */
  override fun run() {
    running = true
    var connected = isConnected()

    while (running) {
      val newConnected = isConnected()
      if (newConnected != connected) {
        connected = newConnected
        Log.i(TAG, "tag " + (if (connected) "connected" else "disconnected"))

        if (connected) {
          try {
            onCardConnected()
          } catch (e: Exception) {
            Log.e(TAG, "onCardConnected: " + e.message)
          }
        } else {
          try {
            onCardDisconnected()
          } catch (e: Exception) {
            Log.e(TAG, "onCardDisconnected: " + e.message)
          }
        }
      }

      SystemClock.sleep(loopSleepMS)
    }
  }

  /**
   * Stops the run loop and interrupts the thread.
   */
  fun shutdown() {
    running = false
    interrupt()
  }

  /**
   * Reacts on card connected by calling the callback of the registered listener.
   */
  private fun onCardConnected() {
    val dep = synchronized(lock) { isoDep }
    if (dep != null) {
      cardListener?.onConnected(dep)
    }
  }

  /**
   * Reacts on card disconnected by calling the callback of the registered listener.
   */
  private fun onCardDisconnected() {
    invalidateTag()
    cardListener?.onDisconnected()
  }

  /**
   * Sets the card listener.
   *
   * @param listener the new listener
   */
  fun setCardListener(listener: NFCCardChannel) {
    cardListener = listener
  }

  companion object {
    private const val TAG = "NFCCardManager"
    private const val DEFAULT_LOOP_SLEEP_MS = 50L
    // a half-coupled tag blocks transceive for the whole timeout
    private const val TRANSSCEIVE_TIMEOUT_MS = 10000
  }
}
