import Foundation
import CoreNFC

@available(iOS 13.0, *)
open class KeycardController: NSObject {

    /// Whether the device supports Keycard reading.
    public static var isAvailable: Bool {
        return NFCNDEFReaderSession.readingAvailable
    }

    private var session: NFCTagReaderSession!
    private let onConnect: (NFCCardChannel) -> Void
    private let onTagDisconnect: () -> Void
    private let onFailure: (Error) -> Void
    private var availabilityTimer: DispatchSourceTimer?
    private let alertMessages: AlertMessages

    public typealias AlertMessages = (
        moreThanOneTagFound: String,
        unsupportedTagType: String,
        tagConnectionError: String
    )

    /// User-facing alert messages for NFC session events.
    public static let defaultAlertMessages = AlertMessages(
        moreThanOneTagFound: "More than one tag was found. Please present only one tag.",
        unsupportedTagType: "Unsupported Smart Card.",
        tagConnectionError: "Connection error. Please try again."
    )

    /// Creates a controller with callbacks for connect, field-exit and session-failure events.
    public init?(alertMessages: AlertMessages = KeycardController.defaultAlertMessages,
                 onConnect: @escaping (NFCCardChannel) -> Void,
                 onTagDisconnect: @escaping () -> Void,
                 onFailure: @escaping (Error) -> Void) {
        self.alertMessages = alertMessages
        self.onConnect = onConnect
        self.onTagDisconnect = onTagDisconnect
        self.onFailure = onFailure
        super.init()
        guard let session = NFCTagReaderSession(pollingOption: .iso14443, delegate: self) else {
            return nil
        }
        self.session = session
    }

    /// Starts the session; onConnect is invoked on a background thread.
    public func start(alertMessage: String? = nil) {
        setAlert(alertMessage)
        session.begin()

    }

    /// Stops the session, showing an error icon and message.
    public func stop(errorMessage: String) {
        session.invalidate(errorMessage: errorMessage)
    }

    /// Stops the session, showing a success icon and optional message.
    public func stop(alertMessage: String?) {
        setAlert(alertMessage)
        session.invalidate()
    }

    /// Updates the alert message (nil is a no-op).
    public func setAlert(_ alertMessage: String?) {
        if let message = alertMessage {
            session.alertMessage = message
        }
    }

    /// Restarts RF polling.
    public func restartPolling() {
        session.restartPolling()
    }

    // CoreNFC has no tag-removal callback: poll tag.isAvailable to detect field exit (Android parity)
    private static let availabilityPollInterval: DispatchTimeInterval = .milliseconds(100)

    private func startAvailabilityMonitoring(for tag: NFCISO7816Tag) {
        stopAvailabilityMonitoring()
        let timer = DispatchSource.makeTimerSource(queue: DispatchQueue.global())
        timer.schedule(deadline: .now() + Self.availabilityPollInterval, repeating: Self.availabilityPollInterval)
        timer.setEventHandler { [weak self] in
            guard let self = self else { return }
            guard !tag.isAvailable else { return }
            self.stopAvailabilityMonitoring()
            // card left the field: keep polling for reconnect, then notify KeycardImp (fires onKeycardDisconnected)
            self.session.restartPolling()
            self.onTagDisconnect()
        }
        timer.resume()
        availabilityTimer = timer
    }

    private func stopAvailabilityMonitoring() {
        availabilityTimer?.cancel()
        availabilityTimer = nil
    }
}

@available(iOS 13.0, *)
extension KeycardController: NFCTagReaderSessionDelegate {

    public func tagReaderSessionDidBecomeActive(_ session: NFCTagReaderSession) {
        // no-op
    }

    public func tagReaderSession(_ session: NFCTagReaderSession, didInvalidateWithError error: Error) {
        stopAvailabilityMonitoring()
        DispatchQueue.global().async { [unowned self] in
            self.onFailure(error)
        }
    }

    public func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        if tags.count > 1 {
            setAlert(alertMessages.moreThanOneTagFound)
            tagRemovalDetect(tags[0])
            return
        }
        guard let first = tags.first, case NFCTag.iso7816(let tag) = first else {
            stop(errorMessage: alertMessages.unsupportedTagType)
            return
        }
        session.connect(to: first) { [weak self] error in
            guard let `self` = self else { return }
            if error != nil {
                self.stop(errorMessage: self.alertMessages.tagConnectionError)
                return
            }
            self.startAvailabilityMonitoring(for: tag)
            DispatchQueue.global().async {
                self.onConnect(NFCCardChannel(tag: tag))
            }
        }
    }

    // from Apple's sample code: poll tag availability, restart polling once the tag leaves the field
    func tagRemovalDetect(_ tag: NFCTag) {
        session.connect(to: tag) { [weak self] error in
            guard let `self` = self else { return }
            guard error == nil && tag.isAvailable else {
                self.session.restartPolling()
                return
            }
            DispatchQueue.global().asyncAfter(deadline: DispatchTime.now() + .milliseconds(500), execute: {
                self.tagRemovalDetect(tag)
            })
        }
    }
}
