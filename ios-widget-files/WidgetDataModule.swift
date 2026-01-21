//
//  WidgetDataModule.swift
//  vocabai
//
//  Swift implementation of widget data synchronization
//

import Foundation
import WidgetKit

@objc(WidgetDataModule)
class WidgetDataModule: NSObject {
    // App Group identifier (must match widget)
    private let appGroupID = "group.com.vocabai.shared"

    // MARK: - Update Widget Data

    @objc
    func updateWidget(
        _ vocabularyData: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        do {
            // Get App Group container
            guard let containerURL = FileManager.default.containerURL(
                forSecurityApplicationGroupIdentifier: appGroupID
            ) else {
                reject("APP_GROUP_ERROR", "Failed to access App Group container", nil)
                return
            }

            // Create directory if needed
            let cacheDir = containerURL
                .appendingPathComponent("Library")
                .appendingPathComponent("Caches")

            try FileManager.default.createDirectory(
                at: cacheDir,
                withIntermediateDirectories: true,
                attributes: nil
            )

            // Write JSON file
            let fileURL = cacheDir.appendingPathComponent("vocabulary.json")

            let jsonData = try JSONSerialization.data(
                withJSONObject: vocabularyData,
                options: [.prettyPrinted]
            )

            try jsonData.write(to: fileURL, options: [.atomic])

            print("✅ Widget data written to: \(fileURL.path)")
            print("📊 Data size: \(jsonData.count) bytes")

            // Trigger widget reload
            WidgetCenter.shared.reloadAllTimelines()

            resolve([
                "success": true,
                "path": fileURL.path,
                "size": jsonData.count
            ])

        } catch {
            print("❌ Failed to write widget data: \(error)")
            reject("WRITE_ERROR", "Failed to write widget data: \(error.localizedDescription)", error)
        }
    }

    // MARK: - Reload Widgets

    @objc
    func reloadWidgets(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        WidgetCenter.shared.reloadAllTimelines()

        print("🔄 Widget reload triggered")

        resolve([
            "success": true,
            "message": "Widgets reloaded"
        ])
    }

    // MARK: - React Native Setup

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
