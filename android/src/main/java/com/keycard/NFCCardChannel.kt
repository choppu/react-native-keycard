package com.keycard

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.nfc.TagLostException
import android.nfc.tech.IsoDep
import android.util.Log
import androidx.core.content.ContextCompat
import java.io.IOException
import kotlin.reflect.KFunction0

enum class StartNFCResult {
  STARTED,
  ALREADY_STARTED,
  UNAVAILABLE,
}

class NFCCardChannel(keycardEvents: Map<String, KFunction0<Unit>>) : BroadcastReceiver() {
  private var nfcAdapter: NfcAdapter? = null
  private var activity: Activity? = null
  private var isoDep: IsoDep? = null
  private var started = false
  private var listening = false
  private val lock = Any()
  private val restartLock = Any()
  private var restartPending = false
  private val cardEvents: Map<String, KFunction0<Unit>> = keycardEvents
  private val cardManager: NFCCardManager

  init {
    cardManager = NFCCardManager(null)
    cardManager.setCardListener(this)
  }

  fun log(message: String) {
    Log.d(TAG, message)
  }

  override fun onReceive(context: Context, intent: Intent) {
    val state = intent.getIntExtra(NfcAdapter.EXTRA_ADAPTER_STATE, NfcAdapter.STATE_OFF)
    when (state) {
      NfcAdapter.STATE_ON -> {
        cardEvents["onKeycardNFCEnabled"]?.invoke()
        log("NFC is ON")
      }
      NfcAdapter.STATE_OFF -> {
        cardEvents["onKeycardNFCDisabled"]?.invoke()
        log("NFC is OFF")
      }
      NfcAdapter.STATE_TURNING_ON -> {
        log("NFC turning on")
      }
      NfcAdapter.STATE_TURNING_OFF -> {
        log("NFC turning off")
      }
      else -> {
        log("Unknown NFC state")
      }
    }
  }

  fun start(activity: Activity?): Boolean {
    if (activity == null) {
      return false
    }

    val firstSetup = synchronized(lock) {
      if (!started) {
        nfcAdapter = NfcAdapter.getDefaultAdapter(activity.baseContext)
        if (!cardManager.isAlive) {
          cardManager.start()
        }
        started = true
        true
      } else {
        false
      }
    }

    val adapter = synchronized(lock) { nfcAdapter }
    if (adapter == null) {
      log("Not supported in this device")
      return false
    }

    if (firstSetup) {
      synchronized(lock) { this.activity = activity }
      val filter = IntentFilter(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED)
      ContextCompat.registerReceiver(activity, this, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
      adapter.enableReaderMode(activity, cardManager, READER_FLAGS, null)
    }
    return true
  }

  fun stop() {
    val act = synchronized(lock) { activity }
    val adapter = synchronized(lock) { nfcAdapter }
    if (act != null && adapter != null) {
      try {
        adapter.disableReaderMode(act)
        act.unregisterReceiver(this)
      } catch (e: Exception) {
        log("stop: " + e.message)
      }
    }
    synchronized(lock) {
      started = false
      this.activity = null
      isoDep = null
    }
    cardManager.shutdown()
  }

  // onTagDiscovered fires only on field entry, so a card that stayed in the field needs a new polling round
  fun restartPolling() {
    val act = synchronized(lock) { activity } ?: return
    val adapter = synchronized(lock) { nfcAdapter } ?: return

    synchronized(restartLock) {
      if (restartPending) {
        return
      }
      restartPending = true
    }

    act.runOnUiThread {
      try {
        adapter.disableReaderMode(act)
        adapter.enableReaderMode(act, cardManager, READER_FLAGS, null)
        log("reader mode restarted")
      } catch (e: IllegalStateException) {
        log("Could not restart reader mode: " + e.message)
      } finally {
        synchronized(restartLock) { restartPending = false }
      }
    }
  }

  fun startNFC(activity: Activity?): StartNFCResult {
    // claim the session atomically so concurrent calls can't both start
    val claimed = synchronized(lock) {
      if (listening) {
        false
      } else {
        listening = true
        true
      }
    }
    if (!claimed) {
      return StartNFCResult.ALREADY_STARTED
    }

    if (!synchronized(lock) { started }) {
      // first-time setup; on failure release the claim so a later startNFC can retry
      if (!start(activity)) {
        synchronized(lock) { listening = false }
        return StartNFCResult.UNAVAILABLE
      }
    }

    val adapter = synchronized(lock) { nfcAdapter }
    if (adapter == null) {
      synchronized(lock) { listening = false }
      return StartNFCResult.UNAVAILABLE
    }

    val haveTag = synchronized(lock) { isoDep != null }

    if (haveTag) {
      cardEvents["onKeycardConnected"]?.invoke()
    } else {
      restartPolling()
    }
    return StartNFCResult.STARTED
  }

  fun stopNFC() {
    synchronized(lock) {
      listening = false
    }
  }

  fun isNFCSupported(activity: Activity?): Boolean {
    return activity != null && activity.packageManager.hasSystemFeature(PackageManager.FEATURE_NFC)
  }

  fun isNFCEnabled(): Boolean {
    return synchronized(lock) {
      nfcAdapter?.isEnabled() ?: false
    }
  }

  fun onConnected(iDep: IsoDep) {
    val shouldNotify = synchronized(lock) {
      isoDep = iDep
      listening
    }

    if (shouldNotify) {
      cardEvents["onKeycardConnected"]?.invoke()
    }
  }

  fun onDisconnected() {
    val shouldNotify = synchronized(lock) {
      isoDep = null
      listening
    }

    if (shouldNotify) {
      cardEvents["onKeycardDisconnected"]?.invoke()
    }
  }

  @OptIn(kotlin.ExperimentalStdlibApi::class)
  fun send(cmd: String): ByteArray {
    val apdu = cmd.hexToByteArray()
    val dep = synchronized(lock) { isoDep }

    try {
      if (dep == null) {
        throw TagLostException(TAG_LOST)
      }
      return dep.transceive(apdu)
    } catch (e: Exception) {
      when (e) {
        is TagLostException, is SecurityException, is IllegalStateException -> {
          // isConnected() stays true for a lost tag until it is closed
          cardManager.invalidateTag()
          restartPolling()
          throw if (e is TagLostException) e else IOException("Tag disconnected", e)
        }
        is IllegalArgumentException -> throw IOException("Malformed card response", e)
        else -> throw e
      }
    }
  }

  fun isConnected(): Boolean {
    return try {
      synchronized(lock) { isoDep?.isConnected() == true }
    } catch (e: SecurityException) {
      false
    }
  }

  companion object {
    const val TAG_LOST: String = "Tag was lost."
    const val READER_FLAGS: Int =
      NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK
    private const val TAG: String = "SmartCard"
  }
}
