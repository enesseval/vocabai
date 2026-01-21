//
//  SavedWord.swift
//  VocabWidget
//
//  Data model for saved vocabulary words
//

import Foundation

struct SavedWord: Codable, Identifiable {
    let word: String
    let translation: String
    let explanation: String
    let savedAt: String
    let masteryLevel: Int

    var id: String { word }

    // Parse date for sorting/display
    var savedDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: savedAt)
    }
}

struct WidgetData: Codable {
    let words: [SavedWord]
    let lastUpdate: String

    var updateDate: Date? {
        let formatter = ISO8601DateFormatter()
        return formatter.date(from: lastUpdate)
    }
}
