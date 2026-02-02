
package com.keycard

import java.io.IOException

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.nfc.tech.IsoDep
import android.util.Log
import android.app.Activity

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap

import kotlin.reflect.KFunction0
import com.keycard.NFCCardManager

class NFCCardChannel(keycardEvents: Map<String, KFunction0<Unit>>): BroadcastReceiver() {
    private var nfcAdapter: NfcAdapter? = null
    private var isoDep: IsoDep? = null;
    val TAG: String = "SmartCard";
    private var started: Boolean = false;
    private @Volatile var listening: Boolean = false;
    private var lock: Any = Any();
    private var cardEvents: Map<String, KFunction0<Unit>> = keycardEvents;
    private var cardManager: NFCCardManager;

    init {
      this.cardManager = NFCCardManager(null);
      this.cardManager.setCardListener(this);
    }

    public fun log(message: String) {
        Log.d(TAG, message)
    }

    override fun onReceive(context: Context, intent: Intent) {
      val state: Int = intent.getIntExtra(NfcAdapter.EXTRA_ADAPTER_STATE, NfcAdapter.STATE_OFF)
      when (state) {
        NfcAdapter.STATE_ON -> {
          this.cardEvents["onKeycardNFCEnabled"]?.invoke()
          log("NFC is ON")
        }
        NfcAdapter.STATE_OFF -> {
          this.cardEvents["onKeycardNFCDisabled"]?.invoke()
          log("NFC is OFF")
        }
        else -> {
          log("No NFC detected")
        }
      }
    }

    public fun start(activity: Activity?): Boolean {
      if(activity == null) {
        return false;
      }

      if (!this.started) {
        this.nfcAdapter = NfcAdapter.getDefaultAdapter(activity.getBaseContext());
        this.cardManager.start();
        this.started = true;
      }

      if (this.nfcAdapter != null) {
        val filter: IntentFilter = IntentFilter(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED);
        activity.registerReceiver(this, filter);
        this.nfcAdapter?.enableReaderMode(activity, this.cardManager, NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK, null);
        return true;
      } else {
        log("Not supported in this device");
        return false;
      }
    }

    public fun stop(activity: Activity?): Unit {
      if (activity != null && this.nfcAdapter != null) {
        this.nfcAdapter?.disableReaderMode(activity);
      }
    }

    public fun startNFC(): Unit {
      synchronized(this.lock) {
        this.listening = true;

        if (this.isoDep != null) {
          this.cardEvents["onKeycardConnected"]?.invoke();
        }
      }
    }

    public fun stopNFC() {
      synchronized(this.lock) {
        this.listening = false;
      }
    }

    public fun isNFCSupported(activity: Activity?): Boolean {
      return activity != null && activity.getPackageManager().hasSystemFeature(PackageManager.FEATURE_NFC);
    }

    public fun isNFCEnabled(): Boolean {
      if (this.nfcAdapter != null) {
        return this.nfcAdapter!!.isEnabled();
      } else {
        return false;
      }
    }

    public fun onConnected(iDep: IsoDep) {
      synchronized(this.lock) {
        this.isoDep = iDep;

        if (this.listening) {
          this.cardEvents["onKeycardConnected"]?.invoke();
        }
      }
    }

    public fun onDisconnected() {
      synchronized(this.lock) {
        this.isoDep = null

            if (this.listening) {
              this.cardEvents["onKeycardDisconnected"]?.invoke();
            }
        }
    }

    public fun send(cmd: String): ByteArray {
      val apdu: ByteArray = @OptIn(kotlin.ExperimentalStdlibApi::class) cmd.hexToByteArray();

      try {
        return this.isoDep!!.transceive(apdu);
      } catch(e: SecurityException) {
        throw IOException("Tag disconnected", e);
      } catch(e: IllegalArgumentException) {
        throw IOException("Malformed card response", e);
      }
    }

    public fun isConnected(): Boolean {
      try {
        return this.isoDep != null && this.isoDep!!.isConnected();
      } catch(e: SecurityException) {
        return false;
      }
    }

    companion object {
      const val MASTER_PATH: String = "m"
      const val ROOT_PATH: String = "m/44'/60'/0'/0"
      const val WALLET_PATH: String = "m/44'/60'/0'/0/0"
      const val WHISPER_PATH: String = "m/43'/60'/1581'/0'/0"
      const val ENCRYPTION_PATH: String = "m/43'/60'/1581'/1'/0"
      const val TAG_LOST: String = "Tag was lost."
      const val WORDS_LIST_SIZE: Int = 2048
    }
}
