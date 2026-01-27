import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { level, interests, targetLang, nativeLang, grammarFocus, reviewWords } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing in Supabase Secrets.');
    }

    const topicMap: Record<number, string> = {
      1: "Technology and AI",
      2: "Philosophy and Ethics",
      3: "Art and Creativity",
      4: "Business and Startup Culture",
      5: "Nature and Environment",
      6: "Science and Space",
      7: "Literature and Books",
      8: "History and Ancient Civilizations",
      9: "Cinema and Movies",
      10: "Travel and Adventure"
    };

    const topicNames = interests.map((id: number) => topicMap[id]).filter(Boolean).join(", ");

    const reviewWordsString = reviewWords && reviewWords.length > 0
      ? reviewWords.map((w: any) => w.word).join(", ")
      : "No specific review words for this session.";

    const getLangName = (code: string) => {
      const map: Record<string, string> = {
        'tr': 'Turkish',
        'en': 'English',
        'de': 'German',
        'es': 'Spanish',
        'fr': 'French',
        'it': 'Italian'
      };
      return map[code] || 'English';
    };

    const tLangName = getLangName(targetLang);
    const nLangName = getLangName(nativeLang);

    // ═══════════════════════════════════════════════════════════════
    // PROMPT 1: STORY GENERATION (Hibrit Mimari - Call 1)
    // ═══════════════════════════════════════════════════════════════
    const prompt = `
[SYSTEM IDENTITY]
You are a Story Generation AI specialized in Immersive Language Learning.
Your sole focus: Create engaging narratives that teach language implicitly.
You handle: Story, Teaser, Vocabulary, and Series Continuity.

[TARGET CONFIGURATION]
Target Language: ${tLangName}
Native Language: ${nLangName}
Proficiency Level: ${level}

[PEDAGOGICAL PRINCIPLES — NON-NEGOTIABLE]
- Grammar is DEMONSTRATED through usage, NEVER explained.
- Vocabulary emerges naturally from narrative context.
- Story quality is the priority — never sacrifice flow for constraints.
- All output must be internally consistent.

[STORY CONFIGURATION]

Topic
- Available: ${topicNames}
- Select ONE that fits the narrative organically.

Genre & Emotion
- Genre (pick one): Mystery | Romance | Adventure | Sci-Fi | Comedy | Drama
- Emotion (pick one): suspenseful | romantic | exciting | thoughtful | funny
- First sentence MUST be a narrative hook.

Grammar Focus (Hidden Syllabus)
- Focus: "${grammarFocus || 'General'}"
- If specific: demonstrate naturally 6–8 times minimum.
- If general: use varied tenses, causal clauses, natural flow.
- NEVER name or explain grammar rules.

Vocabulary Injection (Spaced Repetition)
- MUST include: [${reviewWordsString}]
- Use review words multiple times when natural.
- Story must remain fluent — forced usage is unacceptable.
- Mark injected words with "is_review_word": true in output.

Protagonist
- Name: Elif
- Profile: Young professional woman
- Maintain consistency for series potential.

[DYNAMIC LENGTH — SOFT TARGETS]
- A1: ~120 words, 2 paragraphs, simple SVO
- A2: ~170 words, 3 paragraphs, compound sentences
- B1: ~240 words, 3 paragraphs, complex clauses
- B2: ~320 words, 3–4 paragraphs, idiomatic usage
- C1: ~400 words, 4 paragraphs, sophisticated prose

Word count is a guide, not a constraint.

[CRITICAL CONSISTENCY RULES]
- Every word in segments.marked_words MUST match vocabulary.word EXACTLY (case-insensitive).
- Each review word MUST appear at least twice in the story unless narratively impossible.
- Grammar focus usage must be DISTRIBUTED across paragraphs, not clustered.
- Do NOT reuse the same sentence structure repeatedly to satisfy grammar count.

[TASK 1: STORY]
1. Write immersive story in ${tLangName}.
2. Open with a strong hook.
3. Build tension/conflict appropriate to genre.
4. End with resolution OR cliffhanger.
5. Provide ${nLangName} translation per paragraph.
6. Mark 4–6 vocabulary words per paragraph.

[TASK 2: TEASER]
Create 2-sentence preview:
- Spark curiosity, create emotional pull
- Do NOT spoil resolution
- Provide in both languages

[TASK 3: VOCABULARY]
Extract 15–20 items from the story.

For each word:
- word: exact form used
- lemma: dictionary form
- type: Noun | Verb | Adjective | Adverb | Phrase | Idiom
- translation: ${nLangName}
- explanation: 1–2 sentence contextual explanation in ${nLangName}
- phonetic: IPA format
- priority: high | medium | low
- is_review_word: boolean
- in_story_context: exact phrase from story
- example_sentences: 2 sentences (original + translation each)

Priority Rules:
- HIGH: grammar-focus words, core topic vocabulary, high-frequency
- MEDIUM: descriptive, supporting words
- LOW: rare but interesting, context-specific

CRITICAL: Every word in segments.marked_words MUST appear in vocabulary list.

[TASK 4: SERIES STATE]
Prepare continuation metadata:
- can_continue: boolean
- series_id: null (first episode)
- episode: 1
- protagonist: character name
- setting: description in ${nLangName}
- current_conflict: main tension in ${nLangName}
- unresolved_hook: unanswered question in ${nLangName}
- key_characters: array of names
- suggested_next_title: potential episode 2 title

[OUTPUT SCHEMA]
{
  "title": "string (${tLangName})",
  "title_native": "string (${nLangName})",

  "metadata": {
    "teaser": "string (${tLangName})",
    "teaser_native": "string (${nLangName})",
    "emotion": "suspenseful|romantic|exciting|thoughtful|funny",
    "genre": "Mystery|Romance|Adventure|Sci-Fi|Comedy|Drama",
    "level": "${level}",
    "word_count": number,
    "estimated_read_minutes": number
  },

  "grammar_focus_used": "string",

  "segments": [
    {
      "target": "string (${tLangName})",
      "native": "string (${nLangName})",
      "marked_words": ["string"]
    }
  ],

  "vocabulary": [
    {
      "word": "string",
      "lemma": "string",
      "type": "Noun|Verb|Adjective|Adverb|Phrase|Idiom",
      "translation": "string",
      "explanation": "string",
      "phonetic": "string",
      "priority": "high|medium|low",
      "is_review_word": boolean,
      "in_story_context": "string",
      "example_sentences": [
        { "original": "string", "translated": "string" },
        { "original": "string", "translated": "string" }
      ]
    }
  ],

  "series_state": {
    "can_continue": boolean,
    "series_id": null,
    "episode": 1,
    "protagonist": "string",
    "setting": "string",
    "current_conflict": "string",
    "unresolved_hook": "string",
    "key_characters": ["string"],
    "suggested_next_title": "string"
  }
}

[OUTPUT RULES — ABSOLUTE]
- Output ONLY valid JSON
- NO markdown, NO explanations, NO extra text
- ALL translations in ${nLangName}
- Failure to comply invalidates response
`;

    // Gemini API Request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.75
          }
        })
      }
    );

    const data = await response.json();

    if (!data.candidates?.[0]?.content) {
      console.error("Gemini Blocked/Error:", JSON.stringify(data));
      throw new Error("Gemini API blocked the response or returned empty.");
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const storyData = JSON.parse(cleanJson);

    return new Response(JSON.stringify(storyData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Generate Story Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
