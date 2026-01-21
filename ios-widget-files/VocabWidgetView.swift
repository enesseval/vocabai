//
//  VocabWidgetView.swift
//  VocabWidget
//
//  SwiftUI views for different widget sizes
//

import SwiftUI
import WidgetKit

// MARK: - Widget Entry View

struct VocabWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: VocabEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(words: entry.words)
        case .systemMedium:
            MediumWidgetView(words: entry.words)
        case .systemLarge:
            LargeWidgetView(words: entry.words)
        case .accessoryCircular:
            LockScreenCircularView(word: entry.words.first)
        case .accessoryRectangular:
            LockScreenRectangularView(word: entry.words.first)
        default:
            SmallWidgetView(words: entry.words)
        }
    }
}

// MARK: - Small Widget (2x2)

struct SmallWidgetView: View {
    let words: [SavedWord]

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(red: 30/255, green: 27/255, blue: 75/255),
                    Color.black
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            if let word = words.first {
                VStack(alignment: .leading, spacing: 8) {
                    // Header
                    HStack {
                        Image(systemName: "book.fill")
                            .foregroundColor(Color(red: 251/255, green: 191/255, blue: 36/255))
                        Spacer()
                        Text("\(words.count)")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.5))
                    }

                    Spacer()

                    // Word
                    Text(word.word)
                        .font(.system(size: 18, weight: .bold, design: .serif))
                        .foregroundColor(.white)
                        .lineLimit(2)

                    // Translation
                    Text(word.translation)
                        .font(.system(size: 13))
                        .foregroundColor(.white.opacity(0.7))
                        .lineLimit(2)
                }
                .padding()
            } else {
                // Empty state
                VStack {
                    Image(systemName: "book")
                        .font(.largeTitle)
                        .foregroundColor(.white.opacity(0.3))
                    Text("No words yet")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.5))
                }
            }
        }
    }
}

// MARK: - Medium Widget (4x2)

struct MediumWidgetView: View {
    let words: [SavedWord]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 30/255, green: 27/255, blue: 75/255),
                    Color.black
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            if !words.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    // Header
                    HStack {
                        Image(systemName: "book.fill")
                            .foregroundColor(Color(red: 251/255, green: 191/255, blue: 36/255))
                        Text("My Words")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                        Spacer()
                        Text("\(words.count) saved")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.5))
                    }

                    // Words (show 2)
                    ForEach(words.prefix(2)) { word in
                        WordRow(word: word)
                    }

                    Spacer()
                }
                .padding()
            } else {
                EmptyStateView()
            }
        }
    }
}

// MARK: - Large Widget (4x4)

struct LargeWidgetView: View {
    let words: [SavedWord]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 30/255, green: 27/255, blue: 75/255),
                    Color.black
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            if !words.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    // Header
                    HStack {
                        Image(systemName: "book.fill")
                            .foregroundColor(Color(red: 251/255, green: 191/255, blue: 36/255))
                        Text("My Vocabulary")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                        Spacer()
                        Text("\(words.count)")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.5))
                    }

                    Divider()
                        .background(Color.white.opacity(0.2))

                    // Words (show 4-5)
                    ForEach(words.prefix(5)) { word in
                        WordRow(word: word, showExplanation: true)
                        if word.id != words.prefix(5).last?.id {
                            Divider()
                                .background(Color.white.opacity(0.1))
                        }
                    }

                    Spacer()
                }
                .padding()
            } else {
                EmptyStateView()
            }
        }
    }
}

// MARK: - Lock Screen Circular Widget

struct LockScreenCircularView: View {
    let word: SavedWord?

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()

            if let word = word {
                VStack(spacing: 2) {
                    Image(systemName: "book.fill")
                        .font(.caption2)

                    Text(word.word.prefix(8))
                        .font(.system(size: 10, weight: .bold))
                        .lineLimit(1)
                }
            } else {
                Image(systemName: "book")
                    .font(.title3)
            }
        }
    }
}

// MARK: - Lock Screen Rectangular Widget

struct LockScreenRectangularView: View {
    let word: SavedWord?

    var body: some View {
        if let word = word {
            VStack(alignment: .leading, spacing: 2) {
                Text(word.word)
                    .font(.system(size: 14, weight: .bold))
                    .lineLimit(1)

                Text(word.translation)
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }
        } else {
            Text("No words saved")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// MARK: - Reusable Components

struct WordRow: View {
    let word: SavedWord
    var showExplanation: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(word.word)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(1)

            Text(word.translation)
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.7))
                .lineLimit(1)

            if showExplanation {
                Text(word.explanation)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
                    .lineLimit(2)
            }
        }
    }
}

struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "book")
                .font(.system(size: 40))
                .foregroundColor(.white.opacity(0.3))

            Text("No words saved yet")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.5))

            Text("Start learning in the app")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.4))
        }
    }
}
