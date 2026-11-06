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
    return connectedTag() != null
  }

  private fun connectedTag(): IsoDep? {
    return try {
      synchronized(lock) {
        val dep = isoDep
        if (dep != null && dep.isConnected()) dep else null
      }
    } catch (e: Exception) {
      null
    }
  }

  // isConnected() stays true for a lost tag until it is closed; a tag that was already replaced is left alone
  fun invalidateTag(expected: IsoDep? = null): Boolean {
    val dep = synchronized(lock) {
      val current = isoDep
      if (expected != null && current !== expected) {
        return false
      }
      isoDep = null
      current
    }
    try {
      dep?.close()
    } catch (e: Exception) {
      Log.e(TAG, "invalidateTag: " + e.message)
    }
    return true
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
    // tracks the tag, not presence: a rediscovery within the miss window replaces it without a gap
    var reported: IsoDep? = null
    var misses = 0

    while (running) {
      val dep = connectedTag()
      if (dep != null) {
        misses = 0
        if (dep !== reported) {
          reported = dep
          notifyTransition(dep)
        }
      } else if (reported != null) {
        misses++
        if (misses >= DROP_AFTER_MISSES) {
          misses = 0
          invalidateTag(reported)
          reported = null
          notifyTransition(null)
        }
      }

      SystemClock.sleep(loopSleepMS)
    }
  }

  private fun notifyTransition(dep: IsoDep?) {
    val transition = if (dep != null) "connected" else "disconnected"
    Log.i(TAG, "tag " + transition)
    try {
      if (dep != null) {
        cardListener?.onConnected(dep)
      } else {
        cardListener?.onDisconnected()
      }
    } catch (e: Exception) {
      Log.e(TAG, "error notifying tag " + transition + ": " + e.message)
    }
  }

  fun shutdown() {
    running = false
    interrupt()
  }

  fun setCardListener(listener: NFCCardChannel) {
    cardListener = listener
  }

  companion object {
    private const val TAG = "NFCCardManager"
    private const val DEFAULT_LOOP_SLEEP_MS = 50L
    // a loss re-arms reader mode and the card is back within a few polls; don't report the blip
    private const val DROP_AFTER_MISSES = 3
    // a half-coupled tag blocks transceive for the whole timeout
    private const val TRANSSCEIVE_TIMEOUT_MS = 10000
  }
}
