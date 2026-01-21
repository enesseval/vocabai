# iOS Widget Setup Guide

Complete guide to implementing native iOS widgets with WidgetKit for VocabAI.

---

## 📋 Overview

The iOS widget displays your saved vocabulary words directly on the home screen and lock screen. It syncs automatically with your learning progress.

**Widget Features:**
- Shows random saved words with translations
- Updates every 15 minutes
- Supports multiple widget sizes (Small, Medium, Large)
- Lock Screen widget support
- Deep links to app when tapped
- Shared data via App Groups

---

## 🛠️ Setup Steps

### Step 1: Run Expo Prebuild

First, generate the native iOS project:

```bash
cd /c/Users/Enes/.claude-worktrees/vocabai/practical-tharp
npx expo prebuild --platform ios
```

This creates the `ios/` folder with native Xcode project.

---

### Step 2: Open in Xcode

```bash
open ios/vocabai.xcworkspace
```

**Important:** Always open `.xcworkspace`, not `.xcodeproj`

---

### Step 3: Create Widget Extension

1. In Xcode, click **File** → **New** → **Target**
2. Search for "Widget Extension"
3. Click **Next**
4. Configure:
   - **Product Name**: `VocabWidget`
   - **Team**: Select your Apple Developer team
   - **Include Configuration Intent**: ❌ Uncheck (we don't need it)
5. Click **Finish**
6. When asked "Activate VocabWidget scheme?", click **Activate**

Xcode will create:
```
ios/
└── VocabWidget/
    ├── VocabWidget.swift
    ├── VocabWidget.intentdefinition (delete this)
    └── Assets.xcassets/
```

---

### Step 4: Configure App Groups

App Groups allow the widget to access data from the main app.

**4.1 Enable App Groups for Main App:**
1. Select **vocabai** target (not VocabWidget)
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability** → **App Groups**
4. Click **+** button
5. Add: `group.com.vocabai.shared`
6. Check the checkbox

**4.2 Enable App Groups for Widget:**
1. Select **VocabWidget** target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability** → **App Groups**
4. Add: `group.com.vocabai.shared` (same as above)
5. Check the checkbox

---

### Step 5: Add Swift Files to Widget

Now we'll add our custom Swift files. I'll provide all the code files you need.

**File Structure:**
```
ios/VocabWidget/
├── VocabWidget.swift          (Entry point)
├── VocabWidgetProvider.swift  (Timeline logic)
├── VocabWidgetView.swift      (UI views)
├── SavedWord.swift            (Data model)
└── Assets.xcassets/
```

**How to add files in Xcode:**
1. Right-click on `VocabWidget` folder in Xcode
2. **New File** → **Swift File**
3. Name it (e.g., `VocabWidgetProvider`)
4. Make sure **Target Membership** includes `VocabWidget` ✅

---

### Step 6: Create Native Bridge Module

This allows React Native to trigger widget updates.

**File Structure:**
```
ios/vocabai/
├── WidgetDataModule.m         (Objective-C header)
└── WidgetDataModule.swift     (Swift implementation)
```

**How to add:**
1. Right-click on `vocabai` folder (main app, not widget)
2. **New File** → **Objective-C File**
3. Name: `WidgetDataModule`
4. Xcode asks "Create Bridging Header?" → Click **Create**

This creates:
- `vocabai-Bridging-Header.h`
- `WidgetDataModule.m`

Then add Swift implementation:
1. **New File** → **Swift File**
2. Name: `WidgetDataModule`
3. Target: Main app only

---

### Step 7: Copy Code Files

I'll provide you with all the code files. You'll need to:

1. **Copy Swift widget files** (I'll provide them)
2. **Copy native bridge files** (I'll provide them)
3. **Paste into Xcode**

---

## 📁 Files You'll Receive

### Widget Files (in `ios/VocabWidget/`)
1. `VocabWidget.swift` - Main entry point
2. `VocabWidgetProvider.swift` - Timeline provider
3. `VocabWidgetView.swift` - SwiftUI views
4. `SavedWord.swift` - Data model

### Native Bridge Files (in `ios/vocabai/`)
1. `WidgetDataModule.m` - Objective-C header
2. `WidgetDataModule.swift` - Swift implementation
3. `vocabai-Bridging-Header.h` - Bridge configuration

### Already Exists (from widgetDataSync.ts)
- `src/services/widgetDataSync.ts` ✅ (Week 1)

---

## 🔄 How It Works

```
React Native App
    ↓
VocabularyContext.saveWord()
    ↓
widgetDataSync.syncToWidget()
    ↓
WidgetDataModule.updateWidget()
    ↓
Writes JSON to App Group container
    ↓
WidgetCenter.reloadAllTimelines()
    ↓
Widget reads shared JSON
    ↓
Displays on home/lock screen
```

---

## 🎨 Widget Sizes

### Small Widget (2x2)
- Shows 1 word
- Word + translation
- Minimal UI

### Medium Widget (4x2)
- Shows 2-3 words
- Words in horizontal scroll
- More space for content

### Large Widget (4x4)
- Shows 4-5 words
- List view
- Full explanations

### Lock Screen (Circular/Rectangular)
- Single word
- Translation only
- Compact format

---

## 🔗 Deep Linking

When user taps widget:
```swift
.widgetURL(URL(string: "vocabai://home"))
```

Handled in React Native:
```typescript
Linking.getInitialURL() // On app launch
Linking.addEventListener('url', ...) // While running
```

---

## 📊 Data Format

**Shared JSON structure:**
```json
{
  "words": [
    {
      "word": "serendipity",
      "translation": "şans eseri güzel bulgu",
      "explanation": "Finding something good without looking for it",
      "savedAt": "2024-01-15T10:30:00Z",
      "masteryLevel": 2
    }
  ],
  "lastUpdate": "2024-01-15T10:30:00Z"
}
```

**Stored at:**
```
App Group Container/
└── Library/
    └── Caches/
        └── vocabulary.json
```

---

## ⏱️ Update Strategy

**Timeline Updates:**
- **Every 15 minutes** (WidgetKit minimum)
- **On app launch** (via WidgetCenter.reloadAllTimelines)
- **On word save/delete** (via native bridge)

**Randomization:**
- Widget shows random words from your saved list
- Changes every update to keep it fresh
- Lock screen shows single most recent word

---

## 🎨 Design Tokens

Match app theme:
```swift
Color.purple = Color(red: 108/255, green: 92/255, blue: 231/255) // #6C5CE7
Color.amber = Color(red: 251/255, green: 191/255, blue: 36/255) // #FBBF24
Font.title = .custom("Merriweather-Bold", size: 18)
Font.body = .custom("Inter-Regular", size: 14)
```

---

## 🚀 Testing

### 1. Run Widget in Simulator
1. Select **VocabWidget** scheme in Xcode
2. Choose simulator
3. Click Run ▶️
4. Widget appears on home screen

### 2. Test Data Sync
1. Run main app
2. Save a word
3. Widget should update within 15 minutes
4. Or manually trigger: Long press widget → Edit → Done

### 3. Test Deep Linking
1. Tap widget
2. Should open app to home screen

### 4. Test Lock Screen Widget
1. iOS 16+ only
2. Long press lock screen → Customize
3. Add VocabAI widget
4. Should show single word

---

## ⚠️ Common Issues

### "No such module WidgetKit"
**Fix:** WidgetKit requires iOS 14+. Check deployment target.

### "App Group not found"
**Fix:**
1. Verify App Group ID matches exactly
2. Check both targets have it enabled
3. Clean build folder (Cmd+Shift+K)

### Widget shows "Unable to Load"
**Fix:**
1. Check `vocabulary.json` exists in App Group
2. Verify JSON is valid
3. Check UserDefaults suite name matches

### Widget doesn't update
**Fix:**
1. Call `WidgetCenter.shared.reloadAllTimelines()`
2. Check timeline provider is working
3. Verify App Group permissions

### Fonts not showing
**Fix:**
1. Add fonts to widget target
2. Check `Info.plist` in widget includes fonts
3. Verify font names are correct

---

## 📝 Next Steps After Setup

1. **Test on Device** - Widgets work differently on real devices
2. **Configure Screenshots** - For App Store
3. **Add to App Store Metadata** - Mention widget feature
4. **User Guide** - How to add widget to home screen

---

## 🎯 Checklist Before Build

- [ ] Widget Extension created
- [ ] App Groups configured (both targets)
- [ ] All Swift files added
- [ ] Native bridge module added
- [ ] Bridging header configured
- [ ] Fonts added to widget target
- [ ] Widget tested in simulator
- [ ] Deep linking tested
- [ ] Data sync tested
- [ ] Lock screen widget tested (iOS 16+)

---

## 📚 Resources

- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [App Groups Guide](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_security_application-groups)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Expo Modules Documentation](https://docs.expo.dev/modules/overview/)

---

Ready to receive the Swift code files! 🚀
