//
//  VocabWidget.swift
//  VocabWidget
//
//  Main widget entry point
//

import WidgetKit
import SwiftUI

@main
struct VocabWidget: Widget {
    let kind: String = "VocabWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: VocabWidgetProvider()) { entry in
            VocabWidgetEntryView(entry: entry)
                .containerBackground(for: .widget) {
                    // Background for iOS 17+
                    LinearGradient(
                        colors: [
                            Color(red: 30/255, green: 27/255, blue: 75/255),
                            Color.black
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }
        }
        .configurationDisplayName("My Vocabulary")
        .description("View your saved words at a glance")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryCircular,
            .accessoryRectangular
        ])
    }
}

// MARK: - Widget Preview

#Preview(as: .systemSmall) {
    VocabWidget()
} timeline: {
    VocabEntry(
        date: Date(),
        words: [
            SavedWord(
                word: "serendipity",
                translation: "şans eseri güzel bulgu",
                explanation: "Finding something good without looking for it",
                savedAt: ISO8601DateFormatter().string(from: Date()),
                masteryLevel: 2
            ),
            SavedWord(
                word: "eloquent",
                translation: "güzel konuşan",
                explanation: "Fluent and persuasive in speaking or writing",
                savedAt: ISO8601DateFormatter().string(from: Date()),
                masteryLevel: 1
            )
        ]
    )
}
