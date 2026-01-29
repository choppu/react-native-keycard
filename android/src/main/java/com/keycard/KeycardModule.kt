package com.keycard

import com.facebook.react.bridge.ReactApplicationContext

class KeycardModule(reactContext: ReactApplicationContext) :
  NativeKeycardSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeKeycardSpec.NAME
  }
}
