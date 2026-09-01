
package com.keycard

import java.io.IOException

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.nfc.NfcAdapter
import android.nfc.TagLostException
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
    /** Kept so polling can be restarted after a tag loss; see restartPolling(). */
    private var activity: Activity? = null
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
        this.activity = activity;
        val filter: IntentFilter = IntentFilter(NfcAdapter.ACTION_ADAPTER_STATE_CHANGED);
        activity.registerReceiver(this, filter);
        this.nfcAdapter?.enableReaderMode(activity, this.cardManager, READER_FLAGS, null);
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

    /**
     * Restarts RF polling so a card that never left the field is discovered
     * again — the Android counterpart of CoreNFC's restartPolling().
     *
     * After a tag is closed (see NFCCardManager.invalidateTag) the reader is
     * armed but blind to that card: onTagDiscovered only fires when a tag
     * ENTERS the field, so a card the user simply repositioned is never
     * re-delivered and the session waits forever. Cycling reader mode forces
     * a fresh polling round that picks up whatever is currently present.
     */
    public fun restartPolling(): Unit {
      val act: Activity = this.activity ?: return;
      val adapter: NfcAdapter = this.nfcAdapter ?: return;

      act.runOnUiThread {
        try {
          adapter.disableReaderMode(act);
          adapter.enableReaderMode(act, this.cardManager, READER_FLAGS, null);
          log("reader mode restarted");
        } catch (e: IllegalStateException) {
          // Activity is gone (backgrounded or destroyed); the next start()
          // re-arms the reader anyway.
          log("could not restart reader mode: " + e.message);
        }
      }
    }

    public fun startNFC(): Unit {
      val haveTag: Boolean = synchronized(this.lock) {
        this.listening = true;

        if (this.isoDep != null) {
          this.cardEvents["onKeycardConnected"]?.invoke();
          true
        } else {
          false
        }
      }

      // No live tag: the card may still be sitting on the antenna from a
      // previous, lost session — it will never be re-delivered on its own
      // because onTagDiscovered fires only on field entry. Re-poll so a
      // resumed session finds it without the user lifting the card.
      if (!haveTag) {
        this.restartPolling();
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

    /**
     * Releases the lost tag and re-arms discovery.
     *
     * Both halves are required: without invalidateTag() the runloop never sees
     * the loss (IsoDep.isConnected() lies about a dead tag), and without
     * restartPolling() a card the user merely repositioned is never
     * re-discovered, because onTagDiscovered only fires on field entry.
     */
    private fun dropTag(): Unit {
      this.cardManager.invalidateTag();
      this.restartPolling();
    }

    public fun send(cmd: String): ByteArray {
      val apdu: ByteArray = @OptIn(kotlin.ExperimentalStdlibApi::class) cmd.hexToByteArray();

      // Was `isoDep!!` — onDisconnected() nulls this field, so a send racing a
      // card removal threw an uncaught KotlinNullPointerException. Restores the
      // guard status-keycard's SmartCard.commandSet() has had since 5b456ea;
      // TAG_LOST is the constant this file already declares for exactly this
      // purpose. TagLostException is what transceive() itself throws when the
      // tag leaves the field, so the guard path and the framework path are
      // indistinguishable to the JS side. Never hold the lock across transceive.
      val dep = synchronized(this.lock) { this.isoDep } ?: run {
        this.dropTag();
        throw TagLostException(TAG_LOST);
      }

      val resp = try {
        dep.transceive(apdu);
      } catch(e: TagLostException) {
        // The tag is gone, but IsoDep.isConnected() keeps reporting true until
        // the tag is closed, so the runloop would see no transition: no
        // disconnect event now, and no connect event on the next tap either.
        this.dropTag();
        throw e;
      } catch(e: SecurityException) {
        this.dropTag();
        throw IOException("Tag disconnected", e);
      } catch(e: IllegalStateException) {
        this.dropTag();
        throw IOException("Tag disconnected", e);
      } catch(e: IllegalArgumentException) {
        // A malformed OUTBOUND apdu is a programmer error, not a tag loss:
        // the tag stays valid, so it is not invalidated here.
        throw IOException("Malformed card response", e);
      }

      // A reply shorter than 2 bytes cannot be a valid APDU response (SW1+SW2);
      // it means the exchange was cut short. The Java bridge raised this inside
      // send() via APDUResponse's constructor; classify it here, at the only
      // layer that knows why.
      if (resp.size < 2) {
        this.dropTag();
        throw TagLostException(TAG_LOST);
      }
      return resp;
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
      const val READER_FLAGS: Int =
        NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK
    }
}
