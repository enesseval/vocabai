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
    const { segments, vocabulary, grammarFocus, level, targetLang, nativeLang } = await req.json();

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing in Supabase Secrets.');
    }

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

    // Segment ve vocabulary'yi stringe çevir
    const segmentsText = JSON.stringify(segments, null, 2);
    const vocabularyText = JSON.stringify(vocabulary, null, 2);

    // ═══════════════════════════════════════════════════════════════
    // PROMPT 2: QUIZ GENERATION (Hibrit Mimari - Call 2)
    // ═══════════════════════════════════════════════════════════════
    const prompt = `
[SYSTEM IDENTITY]
You are a Quiz Generation AI specialized in Language Learning Assessment.
Your sole focus: Create quiz questions that test comprehension and vocabulary.
You receive story content as input and generate assessment materials.

[TARGET CONFIGURATION]
Target Language: ${tLangName}
Native Language: ${nLangName}
Proficiency Level: ${level}

[QUIZ PRINCIPLES — NON-NEGOTIABLE]
- ALL questions must be answerable from provided story content ONLY.
- NEVER invent facts, events, or details not in the story.
- Questions must test comprehension, not trick the learner.
- Difficulty must match proficiency level.
- Distractors must be plausible but clearly wrong.

[INPUT DATA]

Story Segments:
${segmentsText}

Vocabulary List:
${vocabularyText}

Grammar Focus: ${grammarFocus || 'General'}

[ANSWER QUALITY RULES]
- Distractors must be grammatically plausible but contextually incorrect.
- Do NOT reuse the correct answer in distractors with minor spelling changes.
- Grammar label must reflect the ACTUAL structure tested in the sentence.
- All options must be similar in length and structure to avoid giving away the answer.

[TASK 1: FILL-IN-THE-BLANK]
Generate 3 questions:
- Use ACTUAL sentences from the story
- Remove ONE key word (preferably grammar-focus or vocabulary item)
- Provide 4 options: 1 correct + 3 plausible distractors
- Include subtle hint
- Label the grammar concept tested (short form: "past simple", "conditionals", etc.)

[TASK 2: TRUE/FALSE]
Generate 3 statements:
- Based STRICTLY on story facts
- Include exact quote as evidence
- Mix: at least 1 true, at least 1 false
- Statements should test comprehension, not memory of minor details

[TASK 3: COMPREHENSION]
Generate 2 questions:
- Use "Why" or "What" question formats
- Answer must be inferrable from story
- Provide answer in both ${tLangName} and ${nLangName}

[TASK 4: WORD MATCH]
Generate 5 pairs:
- Select from provided vocabulary list ONLY
- Pair vocabulary word with ${nLangName} translation
- Prioritize HIGH and MEDIUM priority words
- Do NOT invent translations — use exactly what's in the vocabulary list

[OUTPUT SCHEMA]
{
  "quiz": {
    "fill_in_blank": [
      {
        "sentence": "string (with ___ for blank)",
        "answer": "string",
        "options": ["string", "string", "string", "string"],
        "hint": "string",
        "tests_grammar": "string (short label)"
      }
    ],
    "true_false": [
      {
        "statement": "string",
        "answer": boolean,
        "evidence": "string (quote from story)"
      }
    ],
    "comprehension": [
      {
        "question": "string",
        "answer": "string (${tLangName})",
        "answer_native": "string (${nLangName})"
      }
    ],
    "word_match": [
      {
        "word": "string",
        "translation": "string"
      }
    ]
  }
}

[OUTPUT RULES — ABSOLUTE]
- Output ONLY valid JSON
- NO markdown, NO explanations, NO extra text
- Questions must be solvable from story alone
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
            temperature: 0.5 // Daha düşük temperature = daha tutarlı quiz
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
    const quizData = JSON.parse(cleanJson);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Generate Quiz Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
