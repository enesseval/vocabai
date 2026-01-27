# English Vocabulary Dataset - Multi-Tag System

## CRITICAL: Tag-Based Approach

This dataset uses a **MULTI-TAG SYSTEM** where each word can belong to multiple topics AND multiple purposes. This allows flexible filtering and ensures users get diverse vocabulary even with narrow filters.

---

## Objective

Generate **60-70 words for the TECH topic** with comprehensive tagging. Each word must include:
- Multiple topic tags (primary + related)
- Multiple purpose tags (career, exam, culture, brain)
- 5 contextual example sentences with Turkish translations

---

## Topic: TECH (Technology)

### Keyword Guidelines
- **Core Tech**: computer, software, algorithm, coding, programming, debug, developer
- **AI/ML**: artificial intelligence, machine learning, neural network, deep learning
- **Infrastructure**: database, server, cloud, network, cybersecurity, firewall
- **Modern Tech**: blockchain, cryptocurrency, IoT, automation, robotics
- **Development**: code, framework, library, API, repository, version control

### Multi-Tagging Strategy

Each word should be tagged with:

1. **topics**: Array of relevant topics (primary topic MUST be first)
   - Primary: `["tech"]`
   - Cross-topic examples:
     - `["tech", "business"]` → startup, e-commerce, digital marketing
     - `["tech", "science"]` → algorithm, data analysis, simulation
     - `["tech", "art"]` → digital art, animation software, rendering

2. **purposes**: Array of learning purposes (tag ALL that apply)
   - `career`: Workplace/professional context (interview, job, skills)
   - `exam`: Academic/test preparation context (university, study, research)
   - `brain`: Cognitive development (problem-solving, logic, learning)
   - `culture`: Social/cultural understanding (trends, society impact)

### Difficulty Distribution (60-70 words)
- **Beginner (A1-A2)**: ~25 words (35%)
- **Intermediate (B1-B2)**: ~30 words (45%)
- **Advanced (C1-C2)**: ~12 words (20%)

---

## JSON Structure

```json
{
  "generated_at": "2026-01-26T12:00:00Z",
  "topic": "tech",
  "total_words": 65,
  "words": [
    {
      "word": "algorithm",
      "lemma": "algorithm",
      "translation": "algoritma",
      "explanation": "Bir problemi çözmek için izlenen sistematik adımlar dizisi",
      "example": "This algorithm sorts data in milliseconds",
      "type": "Noun",
      "phonetic": "/ˈælɡəˌrɪðəm/",
      "level": "Intermediate",
      "category": "tech",
      "topics": ["tech", "science"],
      "purposes": ["career", "exam", "brain"],
      "exampleSentences": [
        {
          "original": "She wrote an algorithm to detect patterns in user behavior",
          "translated": "Kullanıcı davranışındaki kalıpları tespit etmek için bir algoritma yazdı"
        },
        {
          "original": "Understanding algorithms is crucial for technical interviews",
          "translated": "Algoritmaları anlamak teknik mülakatlar için çok önemli"
        },
        {
          "original": "This sorting algorithm has O(n log n) time complexity",
          "translated": "Bu sıralama algoritması O(n log n) zaman karmaşıklığına sahip"
        },
        {
          "original": "Machine learning algorithms learn from data without explicit programming",
          "translated": "Makine öğrenimi algoritmaları açık programlama olmadan veriden öğrenir"
        },
        {
          "original": "The algorithm optimizes routes for delivery trucks",
          "translated": "Algoritma teslimat kamyonları için rotaları optimize ediyor"
        }
      ],
      "relatedWords": ["computation", "procedure", "function", "logic", "code"]
    }
  ]
}
```

---

## Tag Assignment Examples

### Example 1: "debugging" (Tech + Career + Brain)
```json
{
  "word": "debugging",
  "topics": ["tech"],
  "purposes": ["career", "brain"],
  "explanation": "Kod hataları bulma ve düzeltme süreci"
}
```
**Why these tags?**
- `career`: Essential job skill, asked in interviews
- `brain`: Requires problem-solving and logical thinking
- NOT `exam`: Rarely appears in academic tests
- NOT `culture`: No significant cultural dimension

### Example 2: "cryptocurrency" (Tech + Business + Culture)
```json
{
  "word": "cryptocurrency",
  "topics": ["tech", "business"],
  "purposes": ["career", "culture"],
  "explanation": "Blockchain teknolojisi kullanan dijital para birimi"
}
```
**Why these tags?**
- `career`: FinTech jobs, blockchain development
- `culture`: Social phenomenon, changes how society views money
- NOT `exam`: Too modern for most curricula
- NOT `brain`: More about knowledge than cognitive skills

### Example 3: "variable" (Tech + Exam + Brain)
```json
{
  "word": "variable",
  "topics": ["tech", "science"],
  "purposes": ["exam", "brain", "career"],
  "explanation": "Programlamada değer saklayan isimlendirilmiş alan"
}
```
**Why these tags?**
- `exam`: Fundamental CS concept, appears in exams
- `brain`: Requires abstract thinking
- `career`: Basic programming skill
- NOT `culture`: No cultural relevance

---

## Quality Requirements

### For Each Word:

1. **Phonetic Notation**: IPA format (e.g., /kəmˈpjuːtər/)

2. **Explanation** (Turkish):
   - Max 20 words
   - Natural Turkish (not literal translation)
   - Explain the concept clearly

3. **Example Sentences**:
   - 5 sentences per word
   - Varied contexts (work, study, daily life)
   - Match difficulty level:
     - Beginner: Simple structure, common vocabulary
     - Intermediate: Some complexity, technical terms
     - Advanced: Complex syntax, specialized context
   - Turkish translations must be fluent and natural

4. **Type**: Noun, Verb, Adjective, Adverb, Phrase, etc.

5. **Topics Array**:
   - Primary topic first: `["tech"]` or `["tech", "business"]`
   - Maximum 2 topics per word

6. **Purposes Array**:
   - Tag ALL applicable purposes
   - Think: "Would this word help someone preparing for [purpose]?"
   - Most words should have 2-3 purposes

7. **Related Words**: 5 words from the same topic area

---

## Word Variety Checklist

Ensure diversity across:
- ✅ Hardware (computer, laptop, processor, chip, device)
- ✅ Software (program, application, code, software, app)
- ✅ Internet (website, browser, online, download, upload)
- ✅ Development (coding, programming, debugging, testing, deploy)
- ✅ Data (database, storage, cloud, backup, server)
- ✅ Security (password, encryption, firewall, virus, malware)
- ✅ Modern Tech (AI, blockchain, IoT, automation, robot)
- ✅ Actions (install, update, restart, configure, optimize)

---

## Output Format

Provide a complete JSON file with 60-70 TECH words, following the structure above. Ensure:
- ✅ Valid JSON format
- ✅ All words have correct multi-tag arrays
- ✅ Difficulty distribution: ~35% Beginner, ~45% Intermediate, ~20% Advanced
- ✅ Every word has exactly 5 example sentences
- ✅ IPA phonetic notation for each word
- ✅ Natural Turkish explanations and translations

---

## START WITH TECH TOPIC

Generate 60-70 words for the **TECH** topic now, following all guidelines above. Focus on comprehensive tagging so words can be filtered by multiple purposes (career, exam, brain, culture).
