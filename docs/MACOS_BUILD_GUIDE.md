# macOS Build Guide - Complete Setup

VocabAI'yi macOS'ta build alıp widget ile TestFlight'a yükleme rehberi.

---

## 📋 Ön Hazırlık

### Gereksinimler
- ✅ macOS (VM üzerinden erişilebilir)
- ✅ Xcode 15+ yüklü olmalı
- ✅ Apple Developer hesabı
- ✅ CocoaPods yüklü (`sudo gem install cocoapods`)
- ✅ Node.js ve npm yüklü

---

## 🚀 Adım 1: Projeyi macOS'a Kopyala

### 1.1 Git Clone (veya Transfer)
```bash
# macOS terminal'de
cd ~/Desktop
git clone [REPO_URL]
cd practical-tharp

# VEYA dosyaları Windows'tan kopyala (USB, network share, etc.)
```

### 1.2 Dependencies Yükle
```bash
npm install
```

### 1.3 CocoaPods Yükle
```bash
cd ios
pod install
cd ..
```

---

## 🔧 Adım 2: Expo Prebuild (iOS Native Project Oluştur)

```bash
npx expo prebuild --platform ios --clean
```

Bu komut `ios/` klasörünü oluşturacak.

---

## 📱 Adım 3: Xcode'da Widget Extension Ekle

### 3.1 Xcode'u Aç
```bash
cd ios
open vocabai.xcworkspace
```

**ÖNEMLİ:** `.xcworkspace` aç, `.xcodeproj` DEĞİL!

### 3.2 Widget Extension Oluştur

1. **File** → **New** → **Target**
2. **Widget Extension** seç → **Next**
3. Yapılandırma:
   - **Product Name**: `VocabWidget`
   - **Team**: Apple Developer teamini seç
   - **Include Configuration Intent**: ❌ Kapat
   - **Next** → **Finish**
4. "Activate VocabWidget scheme?" → **Activate**

### 3.3 Gereksiz Dosyayı Sil
`VocabWidget.intentdefinition` dosyasını sil (sağ tık → Delete → Move to Trash)

---

## 🔐 Adım 4: App Groups Yapılandır

### 4.1 Main App İçin
1. **vocabai** target'ını seç
2. **Signing & Capabilities** tab
3. **+ Capability** → **App Groups**
4. **+** ile ekle: `group.com.vocabai.shared`
5. Checkbox işaretle ✅

### 4.2 Widget İçin
1. **VocabWidget** target'ına geç
2. **Signing & Capabilities** tab
3. **+ Capability** → **App Groups**
4. **+** ile ekle: `group.com.vocabai.shared` (aynı!)
5. Checkbox işaretle ✅

---

## 📄 Adım 5: Widget Dosyalarını Ekle

Tüm dosyalar Windows'taki `ios-widget-files/` klasöründe hazır. macOS'a kopyala ve Xcode'a ekle:

### 5.1 Dosyaları Kopyala
Windows'tan macOS'a kopyala:
- `SavedWord.swift`
- `VocabWidgetProvider.swift`
- `VocabWidgetView.swift`
- `VocabWidget.swift`
- `WidgetDataModule.m`
- `WidgetDataModule.swift`
- `vocabai-Bridging-Header.h`

### 5.2 Widget Dosyalarını Xcode'a Ekle

#### SavedWord.swift
1. **VocabWidget** klasörüne sağ tık → **Add Files to "vocabai"**
2. `SavedWord.swift` seç → **Add**
3. Target Membership: **VocabWidget** ✅

#### VocabWidgetProvider.swift
1. Aynı şekilde ekle
2. Target Membership: **VocabWidget** ✅

#### VocabWidgetView.swift
1. Aynı şekilde ekle
2. Target Membership: **VocabWidget** ✅

#### VocabWidget.swift (Üzerine Yaz)
1. Xcode'daki mevcut `VocabWidget.swift`'i aç
2. Tüm içeriği sil
3. Kopyaladığın dosyadaki içeriği yapıştır
4. **Cmd+S**

---

## 🌉 Adım 6: Native Bridge Ekle

### 6.1 Objective-C Header Oluştur
1. **vocabai** klasörüne (main app) sağ tık
2. **New File** → **Objective-C File**
3. İsim: `WidgetDataModule`
4. **Create Bridging Header** → **Create**

### 6.2 WidgetDataModule.m Düzenle
1. Oluşan `WidgetDataModule.m`'i aç
2. İçeriği sil, kopyaladığın dosyadan yapıştır

### 6.3 WidgetDataModule.swift Ekle
1. **vocabai** klasörüne sağ tık → **New File** → **Swift File**
2. İsim: `WidgetDataModule`
3. Target: **vocabai** (main app) ✅
4. Kopyaladığın içeriği yapıştır

### 6.4 Bridging Header Düzenle
1. `vocabai-Bridging-Header.h` aç
2. İçeriği sil, kopyaladığın dosyadan yapıştır

---

## 🎨 Adım 7: Fontları Widget'a Ekle

1. Sol panelde **vocabai/assets/fonts/** klasörünü bul
2. **Merriweather-Bold.ttf** ve **Inter-Regular.ttf** seç
3. Sağ panel → **Target Membership** → **VocabWidget** ✅

---

## ✅ Adım 8: Build Test

### 8.1 Main App Build
1. Scheme: **vocabai**
2. Target: **Any iOS Device (arm64)**
3. **Product** → **Build** (Cmd+B)
4. Hata olmamalı!

### 8.2 Widget Build
1. Scheme: **VocabWidget**
2. **Product** → **Build** (Cmd+B)
3. Hata olmamalı!

---

## 📦 Adım 9: Archive & TestFlight

### 9.1 Archive Oluştur
1. Scheme: **vocabai**
2. Target: **Any iOS Device (arm64)**
3. **Product** → **Archive**
4. 5-10 dakika bekle

### 9.2 Distribute
1. Archive tamamlanınca **Organizer** açılır
2. **Distribute App**
3. **App Store Connect** seç
4. **Upload** → **Next**
5. Signing: **Automatically manage signing** ✅
6. **Upload**

### 9.3 TestFlight'ta Görüntüle
1. https://appstoreconnect.apple.com
2. **My Apps** → **VocabAI**
3. **TestFlight** tab
4. Build processing başladı (1-2 saat)
5. Processing tamamlanınca test edebilirsin

---

## 🧪 Adım 10: Widget Test

### 10.1 Simulator'de Test
1. Scheme: **VocabWidget**
2. Simulator seç (iPhone 15 Pro)
3. **Run** ▶️
4. Widget simulator'ün home screen'inde açılır

### 10.2 Gerçek Cihazda Test
1. Main app'i çalıştır
2. Kelime kaydet
3. Home screen → Widget ekle
4. Widget kelimeleri görmeli

---

## 🐛 Olası Hatalar ve Çözümler

### "No such module WidgetKit"
**Çözüm:** VocabWidget target → General → iOS Deployment Target → 14.0+

### "App Group not found"
**Çözüm:**
1. App Group ID'ler tam aynı mı kontrol et
2. Her iki target'ta da enabled olmalı
3. Clean Build: **Product** → **Clean Build Folder** (Cmd+Shift+K)

### Widget "Unable to Load"
**Çözüm:**
1. Main app'i en az bir kez çalıştır
2. En az bir kelime kaydet
3. Console'da logları kontrol et

### Fontlar görünmüyor
**Çözüm:**
1. Font dosyalarının VocabWidget target membership'i var mı?
2. Font isimleri doğru mu: `Merriweather-Bold`, `Inter-Regular`

---

## 📋 Kontrol Listesi

Build almadan önce kontrol et:

- [ ] `ios/` klasörü oluşturuldu (prebuild)
- [ ] Widget Extension oluşturuldu
- [ ] App Groups her iki target'ta yapılandırıldı
- [ ] 4 Swift widget dosyası eklendi
- [ ] 3 native bridge dosyası eklendi (main app'te)
- [ ] Fontlar widget target'ına eklendi
- [ ] Main app build oluyor (hatasız)
- [ ] Widget build oluyor (hatasız)
- [ ] Archive oluşturuluyor
- [ ] TestFlight'a yüklenebiliyor

---

## 🎯 Dosya Konumları

### Windows'tan Kopyalanacak Dosyalar

```
C:\Users\Enes\.claude-worktrees\vocabai\practical-tharp\ios-widget-files\
├── SavedWord.swift
├── VocabWidgetProvider.swift
├── VocabWidgetView.swift
├── VocabWidget.swift
├── WidgetDataModule.m
├── WidgetDataModule.swift
└── vocabai-Bridging-Header.h
```

### macOS'ta Hedef Konumlar

**Widget dosyaları:**
```
~/Desktop/practical-tharp/ios/VocabWidget/
├── SavedWord.swift
├── VocabWidgetProvider.swift
├── VocabWidgetView.swift
└── VocabWidget.swift
```

**Native bridge:**
```
~/Desktop/practical-tharp/ios/vocabai/
├── WidgetDataModule.m
├── WidgetDataModule.swift
└── vocabai-Bridging-Header.h
```

---

## 🚀 Hızlı Başlangıç Komutları

macOS'ta çalıştır:

```bash
# 1. Proje klasörüne git
cd ~/Desktop/practical-tharp

# 2. Dependencies
npm install

# 3. Prebuild
npx expo prebuild --platform ios --clean

# 4. CocoaPods
cd ios && pod install && cd ..

# 5. Xcode'da aç
open ios/vocabai.xcworkspace

# Sonra Xcode'da widget ekle (yukarıdaki adımlar)
```

---

## 📞 Sonraki Adımlar

1. **Build tamamlandı mı?** → TestFlight'a yükle
2. **Widget çalışıyor mu?** → Gerçek cihazda test et
3. **Test OK mu?** → App Store'a gönder
4. **Revenue Cat setup** → Gerçek ödemeler için yapılandır

---

Başarılar! 🎉
