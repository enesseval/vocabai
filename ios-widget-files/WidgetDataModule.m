//
//  WidgetDataModule.m
//  vocabai
//
//  Objective-C bridge for React Native to trigger widget updates
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetDataModule, NSObject)

RCT_EXTERN_METHOD(
    updateWidget:(NSDictionary *)vocabularyData
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    reloadWidgets:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject
)

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

@end
