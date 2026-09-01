# fix: thread safety, nil crash, and stopNFCWithError API

## Summary

Three bugs found during integration testing, plus a missing API method for signalling NFC errors to the JS layer.

**Thread safety crash on connect:** The `onConnect` callback was being invoked directly from the NFC session thread. React Native requires all JS calls to run on the main thread, so calling from a background thread caused intermittent crashes that were hard to reproduce. Fixed by wrapping the callback in `DispatchQueue.main.async`.

**Nil crash when starting NFC:** `keycardController` was optional-chained with `?.start(...)` right after being set in the same block, but initialisation can fail silently (missing NFC entitlement, unsupported device). The optional chain would no-op and still return a success result, lying to the caller. Replaced with a `guard let` that returns a proper failure result instead.

**Silent APDU error swallowing:** `send()` used `try?` which discards the thrown error entirely. Any NFC transmission failure came back as `["state": "error"]` with no way to tell a nil channel from a protocol error. Rewritten with `do/catch` so errors are handled distinctly and the success path is unambiguous.

**stopNFCWithError:** Added a dedicated method for stopping the NFC session with an error message, separate from `stopNFC` which always stops cleanly. On iOS both methods now share a private helper to avoid duplicating the resolve/reject logic. Exposed across the full stack: Swift, ObjC bridge, Android stub, and TypeScript spec.

## Test plan

- [ ] Connect a Keycard over NFC and verify the connect callback fires without crashing
- [ ] Test on a device where NFC initialisation fails and confirm `startNFC` returns `{ nfcStarted: false, isSuccess: false }` instead of hanging or crashing
- [ ] Send an APDU with no card present and confirm the error is returned cleanly
- [ ] Call `stopNFCWithError("User cancelled")` from JS and confirm the NFC sheet dismisses with the error message on iOS and resolves without error on Android
