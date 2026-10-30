package com.keycard

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import kotlin.reflect.KFunction0
import android.app.Activity
import android.content.Intent
import android.nfc.TagLostException
import android.provider.Settings
import java.io.IOException

class KeycardModule(reactContext: ReactApplicationContext) : NativeKeycardSpec(reactContext) {
  private var cardChannel: NFCCardChannel? = null

  private val keycardEvents: Map<String, KFunction0<Unit>> = mapOf(
    "onKeycardConnected" to ::emitOnKeycardConnected,
    "onKeycardDisconnected" to ::emitOnKeycardDisconnected,
    "onKeycardNFCEnabled" to ::emitOnKeycardNFCEnabled,
    "onKeycardNFCDisabled" to ::emitOnKeycardNFCDisabled,
  )

  private fun currentActivity(): Activity? = getReactApplicationContext().getCurrentActivity()

  override fun initialize() {
    cardChannel = NFCCardChannel(keycardEvents)
    cardChannel?.start(currentActivity())
  }

  override fun invalidate() {
    cardChannel?.stop()
  }

  override fun isNFCSupported(promise: Promise) {
    promise.resolve(cardChannel?.isNFCSupported(currentActivity()))
  }

  override fun isNFCEnabled(promise: Promise) {
    promise.resolve(cardChannel?.isNFCEnabled())
  }

  override fun openNFCSettings(promise: Promise) {
    val activity = currentActivity()
    if (activity == null) {
      promise.reject("no_activity", "No current activity available")
      return
    }
    activity.startActivity(Intent(Settings.ACTION_NFC_SETTINGS))
    promise.resolve(true)
  }

  override fun isKeycardConnected(): Boolean {
    return if (this.cardChannel == null) false else this.cardChannel!!.isConnected()
  }

  override fun startNFC(prompt: String, promise: Promise) {
    val channel = cardChannel
    if (channel == null) {
      promise.reject("not_initialized", "NFC is not initialized")
      return
    }
    when (channel.startNFC(currentActivity())) {
      StartNFCResult.STARTED -> promise.resolve(true)
      StartNFCResult.ALREADY_STARTED -> promise.reject("already_started", "NFC scanning already started")
      StartNFCResult.UNAVAILABLE -> promise.reject("nfc_unavailable", "NFC is not available")
    }
  }

  // `message` and `isError` are ignored: Android has no system NFC modal to surface them in (iOS-only concern).
  override fun stopNFC(message: String?, isError: Boolean?, promise: Promise) {
    cardChannel?.stopNFC()
    promise.resolve(true)
  }

  @OptIn(kotlin.ExperimentalStdlibApi::class)
  override fun send(apdu: String, promise: Promise) {
    val response = Arguments.createMap().apply {
      putString("data", "")
      putString("state", "error")
    }

    try {
      val resp = cardChannel?.send(apdu)
      if (resp != null) {
        response.putString("data", resp.toHexString())
        response.putString("state", "success")
      }
      promise.resolve(response)
    } catch (e: TagLostException) {
      promise.reject(e)
    } catch (e: IOException) {
      promise.resolve(response)
    } catch (e: Exception) {
      promise.reject(e)
    }
  }

  override fun setNFCMessage(message: String, promise: Promise) {
    promise.reject("unsupported", "setNFCMessage is not supported on Android")
  }

  companion object {
    const val NAME = NativeKeycardSpec.NAME
  }
}
