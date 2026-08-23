#import "Keycard.h"
#import "Keycard-Swift.h"

@implementation Keycard
    RCT_EXPORT_MODULE()
    KeycardImp *keycard;

- (id) init {
    if (self = [super init]) {
      keycard = [KeycardImp new];
    }

    return self;
}

- (void)isNFCSupported:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    resolve(@([keycard isNFCSupported]));
};
- (void)isNFCEnabled:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    resolve(@([keycard isNFCEnabled]));
};
- (void)startNFC:(NSString *)prompt resolve: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    // Weak captures: the file-scope KeycardImp is shared across module
    // instances, so a strong self here would retain a torn-down module (RN
    // reload) for the process lifetime.
    __weak typeof(self) weakSelf = self;
    NSDictionary *result = [keycard startNFC:prompt onConnect: ^() {
      [weakSelf emitOnKeycardConnected];
    } onUserCancel: ^() {
      [weakSelf emitOnNFCUserCancelled];
    } onTimeout: ^() {
      [weakSelf emitOnNFCTimeout];
    } onDisconnect: ^() {
      [weakSelf emitOnKeycardDisconnected];
    }];

    if([[result objectForKey:@"nfcStarted"]  isEqual: @true] && [[result objectForKey:@"isSuccess"]  isEqual: @true]) {
      resolve(@true);
    } else if([[result objectForKey:@"nfcStarted"]  isEqual: @true] && [[result objectForKey:@"isSuccess"]  isEqual: @false]) {
      reject(@"E_KEYCARD", @"already started", nil);
    } else {
      reject(@"E_KEYCARD", @"unavailable", nil);
    }
};
- (void)stopNFCInternal:(NSString *)err resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSNumber * result = [keycard stopNFC:err];
    if([result isEqual: @true]) {
        resolve(result);
    } else {
        reject(@"E_KEYCARD", @"unavailable", nil);
    }
}
- (void)stopNFCWithError:(NSString *)err resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self stopNFCInternal:err resolve:resolve reject:reject];
};
- (void)stopNFC:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self stopNFCInternal:@"" resolve:resolve reject:reject];
};
- (void)setNFCMessage:(NSString *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSNumber * result = [keycard setNFCMessage:message];

    if([result isEqual: @true]) {
        resolve(result);
    } else {
        reject(@"E_KEYCARD", @"unavailable", nil);
    }
}
- (void)openNFCSettings:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    reject(@"E_KEYCARD", @"Unsupported on iOS", nil);
};
- (void)send:(NSString *)apdu resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  NSDictionary *result = [keycard send:apdu];
  if([[result objectForKey:@"state"] isEqual: @"success"]) {
    resolve(result);
  } else {
    // A tag loss carries its classification in "message" ("NFCError:<code>");
    // rejecting with it lets JS tell "card left the field" from "card said
    // no". Same reject code as before — the message is the signal.
    NSString *message = [result objectForKey:@"message"];
    reject(@"E_KEYCARD", message != nil ? message : @"Invalid APDUResponse", nil);
  }
};
- (NSNumber *)isKeycardConnected {
    return [keycard isKeycardConnected];
};

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeKeycardSpecJSI>(params);
}

@end
