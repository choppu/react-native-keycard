package com.keycard

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import kotlin.reflect.KFunction0
import android.app.Activity
import android.content.Intent
import android.provider.Settings
import android.util.Log
import java.io.IOException

class KeycardModule(reactContext: ReactApplicationContext) : NativeKeycardSpec(reactContext) {
  private var cardChannel: NFCCardChannel? = null;

  val keycardEvents: Map<String, KFunction0<Unit>> = mapOf(
    "onKeycardConnected" to ::emitOnKeycardConnected,
    "onKeycardDisconnected" to ::emitOnKeycardDisconnected,
    "onKeycardNFCEnabled" to ::emitOnKeycardNFCEnabled,
    "onKeycardNFCDisabled" to ::emitOnKeycardNFCDisabled,
  )

  override fun initialize() {
    this.cardChannel = NFCCardChannel(keycardEvents);
    this.cardChannel?.start(getReactApplicationContext().getCurrentActivity());
  }

  override fun isNFCSupported(promise: Promise): Unit {
    promise.resolve(this.cardChannel?.isNFCSupported(getReactApplicationContext().getCurrentActivity()));
  }

  override fun isNFCEnabled(promise: Promise): Unit {
    promise.resolve(this.cardChannel?.isNFCEnabled());
  }

  override fun openNFCSettings(promise: Promise): Unit {
    val currentActivity: Activity = getReactApplicationContext().getCurrentActivity() as Activity;
    currentActivity.startActivity(Intent(Settings.ACTION_NFC_SETTINGS));
    promise.resolve(true);
  }

  override fun isKeycardConnected(): Boolean {
    if(this.cardChannel != null) {
      return this.cardChannel!!.isConnected();
    } else {
      return false;
    }
  }

  override fun startNFC(promise: Promise) {
    cardChannel?.startNFC();
    promise.resolve(true);
  }

  override fun stopNFC(promise: Promise) {
    cardChannel?.stopNFC();
    promise.resolve(true);
  }

  override fun send(apdu: String, promise: Promise) {
    var response: WritableMap = Arguments.createMap().apply {
        putString("data", "");
        putString("state", "error")
    }

    try {
      val resp: ByteArray? = this.cardChannel?.send(apdu);
      var state: String = if (resp != null) "success" else "error";
      response.putString("data", @OptIn(kotlin.ExperimentalStdlibApi::class) if(resp != null) resp.toHexString() else "");
      response.putString("state", state);
      promise.resolve(response);
    } catch(e: IOException) {
      promise.resolve(response);
    }
  }

  companion object {
    const val NAME = NativeKeycardSpec.NAME;
    private val TAG: String = "StatusKeycard";
  }
}
