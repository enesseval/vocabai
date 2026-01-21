//
//  VocabWidgetProvider.swift
//  VocabWidget
//
//  Timeline provider for WidgetKit
//

import WidgetKit
import SwiftUI

struct VocabEntry: TimelineEntry {
    let date: Date
    let words: [SavedWord]
}

struct VocabWidgetProvider: TimelineProvider {
    // App Group identifier (must match React Native)
    private let appGroupID = "group.com.vocabai.shared"

    func placeholder(in context: Context) -> VocabEntry {
        // Placeholder shown while widget loads
        VocabEntry(
            date: Date(),
            words: [
                SavedWord(
                    word: "serendipity",
                    translation: "şans eseri güzel bulgu",
                    explanation: "Finding something good without looking for it",
                    savedAt: ISO8601DateFormatter().string(from: Date()),
                    masteryLevel: 2
                )
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (VocabEntry) -> Void) {
        // Snapshot for widget gallery
        let entry = loadEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<VocabEntry>) -> Void) {
        // Timeline entries (widget updates)
        let entry = loadEntry()

        // Update every 15 minutes (WidgetKit minimum)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!

        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    // MARK: - Load Data from App Group

    private func loadEntry() -> VocabEntry {
        guard let containerURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroupID
        ) else {
            print("❌ Failed to get App Group container")
            return placeholder(in: Context())
        }

        let fileURL = containerURL
            .appendingPathComponent("Library")
            .appendingPathComponent("Caches")
            .appendingPathComponent("vocabulary.json")

        guard let data = try? Data(contentsOf: fileURL) else {
            print("❌ Failed to load vocabulary.json from \(fileURL.path)")
            return placeholder(in: Context())
        }

        guard let widgetData = try? JSONDecoder().decode(WidgetData.self, from: data) else {
            print("❌ Failed to decode vocabulary.json")
            return placeholder(in: Context())
        }

        print("✅ Loaded \(widgetData.words.count) words from App Group")

        // Randomize words for variety
        let shuffledWords = widgetData.words.shuffled()

        return VocabEntry(
            date: Date(),
            words: shuffledWords
        )
    }
}
