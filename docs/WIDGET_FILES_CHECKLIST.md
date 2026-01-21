# Widget Files Transfer Checklist

Bu dosyalar Windows'tan macOS'a kopyalanacak ve Xcode'a eklenecek.

---

## 📂 Dosya Konumları

### Windows (Kaynak)
```
C:\Users\Enes\.claude-worktrees\vocabai\practical-tharp\ios-widget-files\
```

### macOS (Hedef)
Xcode'da manuel olarak eklenecek (drag-drop veya Add Files)

---

## ✅ Transfer Edilecek Dosyalar

### 1. Widget Dosyaları (VocabWidget target'ına eklenecek)

#### ✅ SavedWord.swift
- **Konum:** `ios-widget-files/SavedWord.swift`
- **Hedef:** Xcode'da VocabWidget klasörü
- **Target Membership:** VocabWidget ✅
- **Boyut:** ~500 bytes
- **Açıklama:** Data model for vocabulary words

#### ✅ VocabWidgetProvider.swift
- **Konum:** `ios-widget-files/VocabWidgetProvider.swift`
- **Hedef:** Xcode'da VocabWidget klasörü
- **Target Membership:** VocabWidget ✅
- **Boyut:** ~2 KB
- **Açıklama:** Timeline provider, widget updates

#### ✅ VocabWidgetView.swift
- **Konum:** `ios-widget-files/VocabWidgetView.swift`
- **Hedef:** Xcode'da VocabWidget klasörü
- **Target Membership:** VocabWidget ✅
- **Boyut:** ~6 KB
- **Açıklama:** SwiftUI views (Small/Medium/Large/Lock Screen)

#### ✅ VocabWidget.swift
- **Konum:** `ios-widget-files/VocabWidget.swift`
- **Hedef:** Xcode'da mevcut VocabWidget.swift'in üzerine yaz
- **Target Membership:** VocabWidget ✅
- **Boyut:** ~1 KB
- **Açıklama:** Widget entry point

---

### 2. Native Bridge Dosyaları (vocabai main app target'ına eklenecek)

#### ✅ WidgetDataModule.m
- **Konum:** `ios-widget-files/WidgetDataModule.m`
- **Hedef:** Xcode'da vocabai klasörü
- **Target Membership:** vocabai ✅ (main app)
- **Boyut:** ~400 bytes
- **Açıklama:** Objective-C header for React Native bridge

#### ✅ WidgetDataModule.swift
- **Konum:** `ios-widget-files/WidgetDataModule.swift`
- **Hedef:** Xcode'da vocabai klasörü
- **Target Membership:** vocabai ✅ (main app)
- **Boyut:** ~2 KB
- **Açıklama:** Swift implementation, writes to App Group

#### ✅ vocabai-Bridging-Header.h
- **Konum:** `ios-widget-files/vocabai-Bridging-Header.h`
- **Hedef:** Xcode'da vocabai klasörü (prebuild sonrası oluşur)
- **Target Membership:** vocabai ✅ (main app)
- **Boyut:** ~200 bytes
- **Açıklama:** Objective-C/Swift bridge configuration

---

## 📋 Dosya İçerik Özeti

### SavedWord.swift
```swift
struct SavedWord: Codable, Identifiable {
    let word: String
    let translation: String
    let explanation: String
    let savedAt: String
    let masteryLevel: Int
}

struct WidgetData: Codable {
    let words: [SavedWord]
    let lastUpdate: String
}
```

### VocabWidgetProvider.swift
- Timeline provider
- Loads data from App Group
- Updates every 15 minutes
- Returns random words

### VocabWidgetView.swift
- SmallWidgetView (2x2)
- MediumWidgetView (4x2)
- LargeWidgetView (4x4)
- LockScreenCircularView
- LockScreenRectangularView

### VocabWidget.swift
```swift
@main
struct VocabWidget: Widget {
    let kind: String = "VocabWidget"
    // Configuration
}
```

### WidgetDataModule.m
```objc
@interface RCT_EXTERN_MODULE(WidgetDataModule, NSObject)
RCT_EXTERN_METHOD(updateWidget:...)
RCT_EXTERN_METHOD(reloadWidgets:...)
@end
```

### WidgetDataModule.swift
```swift
@objc(WidgetDataModule)
class WidgetDataModule: NSObject {
    func updateWidget(...) { ... }
    func reloadWidgets(...) { ... }
}
```

### vocabai-Bridging-Header.h
```objc
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
```

---

## 🔄 Transfer Yöntemi

### Seçenek 1: USB Drive
1. Windows'ta dosyaları USB'ye kopyala
2. USB'yi macOS'a tak
3. Dosyaları Desktop'a kopyala

### Seçenek 2: Cloud (Önerilen)
1. Dosyaları Google Drive/Dropbox'a yükle
2. macOS'ta indir

### Seçenek 3: GitHub
```bash
# Windows'ta
git add ios-widget-files/
git commit -m "Add iOS widget files"
git push

# macOS'ta
git pull
```

### Seçenek 4: Network Share
- Windows shared folder
- macOS'tan network share'e eriş
- Kopyala

---

## 🎯 Xcode'a Ekleme Sırası

### Adım 1: Widget Dosyaları
1. SavedWord.swift → VocabWidget klasörü
2. VocabWidgetProvider.swift → VocabWidget klasörü
3. VocabWidgetView.swift → VocabWidget klasörü
4. VocabWidget.swift → Mevcut dosyanın üzerine yaz

**Her dosya için kontrol:**
- Target Membership: VocabWidget ✅

### Adım 2: Native Bridge
1. WidgetDataModule.m → vocabai klasörü
2. WidgetDataModule.swift → vocabai klasörü
3. vocabai-Bridging-Header.h → Mevcut dosyanın üzerine yaz

**Her dosya için kontrol:**
- Target Membership: vocabai ✅ (VocabWidget DEĞİL!)

---

## ✅ Doğrulama

Build almadan önce kontrol et:

```
VocabWidget klasöründe:
- [x] SavedWord.swift
- [x] VocabWidgetProvider.swift
- [x] VocabWidgetView.swift
- [x] VocabWidget.swift

vocabai klasöründe:
- [x] WidgetDataModule.m
- [x] WidgetDataModule.swift
- [x] vocabai-Bridging-Header.h

Target Memberships:
- [x] Widget dosyaları → VocabWidget target
- [x] Bridge dosyaları → vocabai target
```

---

## 🔍 Dosya İçerik Hash (Doğrulama için)

Windows'ta bu dosyaların checksum'ını kontrol edebilirsin:

```bash
# Windows PowerShell'de
Get-FileHash ios-widget-files\SavedWord.swift
Get-FileHash ios-widget-files\VocabWidgetProvider.swift
# ... diğer dosyalar
```

macOS'ta:
```bash
shasum -a 256 SavedWord.swift
shasum -a 256 VocabWidgetProvider.swift
# ... diğer dosyalar
```

Hash'ler eşleşirse dosyalar doğru kopyalandı.

---

## 📞 Sorun Giderme

### "File not found" hatası
- Dosyaların Xcode'da doğru klasörde olduğundan emin ol
- Target Membership'leri kontrol et

### Build error: "Duplicate symbol"
- Dosyaların birden fazla target'a eklenmiş olabilir
- Target Membership'i düzelt

### Widget görünmüyor
- 7 dosyanın tamamı eklenmiş mi kontrol et
- App Groups yapılandırıldı mı kontrol et

---

Tüm dosyalar `ios-widget-files/` klasöründe hazır!

macOS'a transfer et ve Xcode'da ekle 🚀
