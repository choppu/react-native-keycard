package com.keycard

import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.IsoDep
import android.os.SystemClock
import android.util.Log
import java.io.IOException

/** Manages card connection; CardListener callbacks are invoked from the runloop thread. */
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

  fun isConnected(): Boolean {
    return try {
      synchronized(lock) {
        val dep = isoDep
        dep != null && dep.isConnected()
      }
    } catch (e: Exception) {
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
      dep.setTimeout(TRANSSCEIVE_TIMEOUT_MS)
      synchronized(lock) { isoDep = dep }
    } catch (e: Exception) {
      Log.e(TAG, "Error connecting to tag", e)
    }
  }

  override fun run() {
    running = true
    var connected = isConnected()
    var misses = 0

    while (running) {
      if (isConnected()) {
        misses = 0
        if (!connected) {
          connected = true
          notifyTransition(connected)
        }
      } else if (connected) {
        // closing on the first missed read would abort a link that a marginal couple survives
        misses++
        if (misses >= DROP_AFTER_MISSES) {
          misses = 0
          connected = false
          notifyTransition(connected)
        }
      }

      SystemClock.sleep(loopSleepMS)
    }
  }

  private fun notifyTransition(connected: Boolean) {
    val transition = if (connected) "connected" else "disconnected"
    Log.i(TAG, "tag " + transition)
    try {
      if (connected) {
        onCardConnected()
      } else {
        onCardDisconnected()
      }
    } catch (e: Exception) {
      Log.e(TAG, "error notifying tag " + transition + ": " + e.message)
    }
  }

  fun shutdown() {
    running = false
    interrupt()
  }

  private fun onCardConnected() {
    val dep = synchronized(lock) { isoDep }
    if (dep != null) {
      cardListener?.onConnected(dep)
    }
  }

  private fun onCardDisconnected() {
    invalidateTag()
    cardListener?.onDisconnected()
  }

  fun setCardListener(listener: NFCCardChannel) {
    cardListener = listener
  }

  companion object {
    private const val TAG = "NFCCardManager"
    private const val DEFAULT_LOOP_SLEEP_MS = 50L
    // consecutive missed reads before the tag is declared lost
    private const val DROP_AFTER_MISSES = 3
    // a half-coupled tag blocks transceive for the whole timeout
    private const val TRANSSCEIVE_TIMEOUT_MS = 10000
  }
}
