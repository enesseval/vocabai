# iOS Widget Implementation - Step by Step Guide

Bu rehber iOS widget'ını Xcode'da nasıl ekleyeceğinizi adım adım gösterir.

---

## 📦 Hazırlık: Dosyalar Nerede?

Tüm gerekli kod dosyaları `ios-widget-files/` klasöründe hazır:

```
ios-widget-files/
├── SavedWord.swift                    ← Widget için data model
├── VocabWidgetProvider.swift          ← Timeline provider
├── VocabWidgetView.swift              ← SwiftUI views
├── VocabWidget.swift                  ← Widget entry point
├── WidgetDataModule.m                 ← Native bridge (Objective-C)
├── WidgetDataModule.swift             ← Native bridge (Swift)
└── vocabai-Bridging-Header.h         ← Objective-C/Swift bridge
```

---

## 🚀 Adım 1: Expo Prebuild

Terminal'de proje klasöründe:

```bash
cd C:\Users\Enes\.claude-worktrees\vocabai\practical-tharp
npx expo prebuild --platform ios
```

Bu komut `ios/` klasörünü oluşturur.

---

## 🔧 Adım 2: Xcode'da Aç

```bash
cd ios
open vocabai.xcworkspace
```

**ÖNEMLİ:** `.xcworkspace` açın, `.xcodeproj` DEĞİL!

---

## 📱 Adım 3: Widget Extension Oluştur

### 3.1 Yeni Target Ekle
1. Xcode'da **File** → **New** → **Target**
2. Arama kutusuna: **Widget Extension** yaz
3. **Widget Extension** seç → **Next**

### 3.2 Yapılandırma
- **Product Name**: `VocabWidget`
- **Team**: Apple Developer hesabını seç
- **Include Configuration Intent**: ❌ KAPAT (İhtiyacımız yok)
- **Next** → **Finish**

### 3.3 Scheme Aktif Et
- "Activate VocabWidget scheme?" çıkarsa → **Activate**

### 3.4 Oluşturulan Dosyalar
Xcode şunları yaratacak:
```
ios/VocabWidget/
├── VocabWidget.swift
├── VocabWidget.intentdefinition  ← Bunu SİL
└── Assets.xcassets/
```

**VocabWidget.intentdefinition dosyasını SİL** (sağ tık → Delete → Move to Trash)

---

## 🔐 Adım 4: App Groups Yapılandırma

### 4.1 Main App İçin

1. **vocabai** target'ını seç (sol panelden)
2. **Signing & Capabilities** tab'ına git
3. **+ Capability** butonuna tıkla
4. **App Groups** seç
5. **+** butonuna tıkla (App Groups içinde)
6. Ekle: `group.com.vocabai.shared`
7. Checkbox'ı işaretle ✅

### 4.2 Widget İçin

1. **VocabWidget** target'ına geç
2. **Signing & Capabilities** tab'ına git
3. **+ Capability** → **App Groups**
4. **+** butonuna tıkla
5. Ekle: `group.com.vocabai.shared` (aynı isim!)
6. Checkbox'ı işaretle ✅

---

## 📄 Adım 5: Widget Dosyalarını Ekle

### 5.1 SavedWord.swift
1. Xcode'da **VocabWidget** klasörüne sağ tık
2. **New File** → **Swift File**
3. İsim: `SavedWord`
4. **Create**
5. Dosyanın içeriğini `ios-widget-files/SavedWord.swift`'den kopyala

### 5.2 VocabWidgetProvider.swift
1. **VocabWidget** klasörüne sağ tık → **New File** → **Swift File**
2. İsim: `VocabWidgetProvider`
3. **Create**
4. İçeriği `ios-widget-files/VocabWidgetProvider.swift`'den kopyala

### 5.3 VocabWidgetView.swift
1. **New File** → **Swift File**
2. İsim: `VocabWidgetView`
3. **Create**
4. İçeriği `ios-widget-files/VocabWidgetView.swift`'den kopyala

### 5.4 VocabWidget.swift (Üzerine Yaz)
1. Xcode'daki mevcut `VocabWidget.swift` dosyasını aç
2. TÜM içeriğini sil
3. `ios-widget-files/VocabWidget.swift`'deki içeriği yapıştır
4. **Cmd+S** ile kaydet

**KONTROL:** Her dosyayı ekledikten sonra sağ panelde **Target Membership** bölümünde **VocabWidget** işaretli olmalı ✅

---

## 🌉 Adım 6: Native Bridge Modülü

### 6.1 Objective-C Header Oluştur

1. **vocabai** klasörüne sağ tık (ana uygulama, widget değil!)
2. **New File** → **Objective-C File**
3. İsim: `WidgetDataModule`
4. **Next** → **Create**
5. Xcode soracak: **"Would you like to configure an Objective-C bridging header?"**
6. **Create Bridging Header** tıkla

Bu 2 dosya yaratacak:
- `vocabai-Bridging-Header.h`
- `WidgetDataModule.m`

### 6.2 WidgetDataModule.m Düzenle

1. Mevcut `WidgetDataModule.m`'i aç
2. TÜM içeriğini sil
3. `ios-widget-files/WidgetDataModule.m`'deki içeriği yapıştır
4. **Cmd+S** ile kaydet

### 6.3 Swift Implementation Ekle

1. **vocabai** klasörüne sağ tık → **New File** → **Swift File**
2. İsim: `WidgetDataModule`
3. **Create**
4. İçeriği `ios-widget-files/WidgetDataModule.swift`'den kopyala
5. **Cmd+S** ile kaydet

**KONTROL:** Target Membership'te **vocabai** seçili olmalı (VocabWidget DEĞİL!)

### 6.4 Bridging Header Düzenle

1. `vocabai-Bridging-Header.h` dosyasını aç
2. TÜM içeriğini sil
3. `ios-widget-files/vocabai-Bridging-Header.h`'deki içeriği yapıştır
4. **Cmd+S** ile kaydet

---

## 🎨 Adım 7: Font'ları Widget'a Ekle

Widget UI'da uygulama ile aynı fontları kullanıyoruz.

1. Sol panelde **vocabai** klasörünü genişlet
2. **assets/fonts/** klasörünü bul
3. **Merriweather-Bold.ttf** ve **Inter-Regular.ttf** dosyalarını seç
4. Sağ panelde **Target Membership** bölümüne git
5. **VocabWidget** checkbox'ını işaretle ✅

Şimdi fontlar hem app'te hem widget'ta çalışacak.

---

## ✅ Adım 8: Derleme Kontrolü

### 8.1 Build Main App
1. Scheme'i **vocabai** olarak değiştir (üst bar, sol tarafta)
2. Simulator seç (örn: iPhone 15 Pro)
3. **Cmd+B** ile build et
4. Hata çıkmamalı

### 8.2 Build Widget
1. Scheme'i **VocabWidget** olarak değiştir
2. **Cmd+B** ile build et
3. Hata çıkmamalı

---

## 🧪 Adım 9: Test

### 9.1 Widget'ı Simulator'de Çalıştır

1. Scheme: **VocabWidget**
2. Simulator: **iPhone 15 Pro** (veya başka)
3. **Run** butonuna bas ▶️

Widget simulator'ün home screen'inde açılacak!

### 9.2 Ana Uygulamayı Çalıştır

1. Scheme: **vocabai**
2. **Run** ▶️
3. Onboarding'i tamamla
4. Bir hikaye oku
5. Kelime kaydet

### 9.3 Widget Güncellemesini Kontrol

Widget 15 dakikada bir otomatik güncellenir, ama hemen test etmek için:

**Manuel Güncelleme:**
1. Simulator'de widget'a uzun bas
2. **Edit Widget** → **Done**
3. Widget yeni kelimeleri göstermeli

**Otomatik Güncelleme:**
- Kelime kaydedince `WidgetCenter.reloadAllTimelines()` çağrılır
- Widget hemen güncellenir

---

## 🔗 Adım 10: Deep Linking Test

Widget'a tıklayınca uygulamayı açmalı.

1. Widget'a tıkla
2. Uygulama açılmalı
3. Ana ekrana gitmeli

---

## 📊 Doğrulama Checklist

Tamamlayınca kontrol et:

- [ ] `ios/VocabWidget/` klasörü var
- [ ] 4 Swift dosyası widget target'ında: SavedWord, Provider, View, VocabWidget
- [ ] App Groups her iki target'ta da aktif
- [ ] Native bridge dosyaları main app'te: `.m`, `.swift`, bridging header
- [ ] Fontlar widget target'ına eklendi
- [ ] Main app build oluyor (hatasız)
- [ ] Widget build oluyor (hatasız)
- [ ] Widget simulator'de görünüyor
- [ ] Kelime kaydedince widget güncelleniyor
- [ ] Widget'a tıklayınca app açılıyor

---

## 🐛 Yaygın Hatalar ve Çözümler

### Build Error: "No such module 'WidgetKit'"
**Çözüm:** iOS deployment target 14.0+ olmalı
1. VocabWidget target'ı seç
2. **General** → **Minimum Deployments**
3. **iOS 14.0** veya üzeri yap

### "App Group not found"
**Çözüm:**
1. App Group ID'lerin tam olarak aynı olduğundan emin ol
2. Her iki target'ta da enabled olmalı
3. Xcode'u kapat-aç
4. Clean build: **Product** → **Clean Build Folder** (Cmd+Shift+K)

### Widget "Unable to Load" diyor
**Çözüm:**
1. Main app'i en az bir kez çalıştır (data yaratması için)
2. En az bir kelime kaydet
3. Widget'ı manuel yenile (uzun bas → Edit → Done)
4. Console'u kontrol et (Xcode → View → Debug Area → Console)

### Fontlar görünmüyor
**Çözüm:**
1. Font dosyalarının VocabWidget target membership'i var mı kontrol et
2. Font isimlerini doğrula: `Merriweather-Bold`, `Inter-Regular`
3. Exact casing önemli!

### Widget güncellen miyor
**Çözüm:**
1. Ana uygulamada kelime kaydetmeyi dene
2. Console'da "✅ Widget data written" mesajını ara
3. App Group path'inin doğru olduğunu kontrol et
4. 15 dakika bekle (otomatik güncelleme)

---

## 🎯 Sonraki Adımlar

Widget çalışıyorsa:

1. **Gerçek Cihazda Test** - Widget'lar gerçek cihazda farklı çalışabilir
2. **Lock Screen Widget Test** - iOS 16+ gerekir
3. **Çeşitli Widget Boyutları** - Small/Medium/Large test et
4. **App Store Screenshots** - Widget özelliğini göster
5. **Production Build** - Archive ve TestFlight'a yükle

---

## 📸 Widget Preview

Widget'ın nasıl görüneceği:

**Small (2x2):**
- 1 kelime + çeviri
- Kaydedilen toplam kelime sayısı

**Medium (4x2):**
- 2 kelime liste halinde
- "My Words" başlığı

**Large (4x4):**
- 5 kelimeye kadar liste
- Her kelime için açıklama

**Lock Screen:**
- Circular: Tek kelime
- Rectangular: Kelime + çeviri

---

Tamamdır! Widget artık çalışıyor olmalı 🎉

Sorun çıkarsa `Console` çıktısını kontrol et veya hangi adımda takıldığını belirt!
