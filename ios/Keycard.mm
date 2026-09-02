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
    NSDictionary *result = [keycard startNFC:prompt onConnect: ^() {
      [self emitOnKeycardConnected];
    } onUserCancel: ^() {
      [self emitOnNFCUserCancelled];
    } onTimeout: ^() {
      [self emitOnNFCTimeout];
    }];

    if([[result objectForKey:@"nfcStarted"]  isEqual: @true] && [[result objectForKey:@"isSuccess"]  isEqual: @true]) {
      resolve(@true);
    } else if([[result objectForKey:@"nfcStarted"]  isEqual: @true] && [[result objectForKey:@"isSuccess"]  isEqual: @false]) {
      reject(@"E_KEYCARD", @"already started", nil);
    } else {
      reject(@"E_KEYCARD", @"unavailable", nil);
    }
};
- (void)resolveStopResult:(NSNumber *)result resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    if([result isEqual: @true]) {
        resolve(result);
    } else {
        reject(@"E_KEYCARD", @"unavailable", nil);
    }
}
- (void)stopNFCWithError:(NSString *)err resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self resolveStopResult:[keycard stopNFCWithErrorMessage:err] resolve:resolve reject:reject];
};
- (void)stopNFC:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self resolveStopResult:[keycard stopNFCWithSuccessMessage:@""] resolve:resolve reject:reject];
};
// Success path carrying the caller's own wording onto Apple's sheet. Kept
// separate from stopNFC so existing callers keep the generic "Success".
- (void)stopNFCWithMessage:(NSString *)message resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [self resolveStopResult:[keycard stopNFCWithSuccessMessage:message] resolve:resolve reject:reject];
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
    reject(@"E_KEYCARD", @"Invalid APDUResponse", nil);
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
