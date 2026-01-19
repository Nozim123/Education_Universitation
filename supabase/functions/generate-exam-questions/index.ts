import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { examType, section, difficulty = "intermediate", questionCount = 10 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Different prompts based on exam type and section
    const examPrompts: Record<string, Record<string, string>> = {
      ielts: {
        listening: `Generate IELTS Listening-style questions. Include:
- Form completion tasks (fill in blanks from audio context)
- Multiple choice about conversations/lectures
- Map/diagram labeling scenarios
- Note completion tasks
Each question should have clear audio context description.`,
        reading: `Generate IELTS Reading-style questions. Include:
- True/False/Not Given questions with academic passages
- Matching headings to paragraphs
- Summary completion
- Multiple choice comprehension
Include a short reading passage context for each question set.`,
        writing: `Generate IELTS Writing-style prompts. Include:
- Task 1: Data description (charts, graphs, processes)
- Task 2: Essay prompts (agree/disagree, discuss both views)
Provide clear rubric criteria for evaluation.`,
        speaking: `Generate IELTS Speaking-style prompts. Include:
- Part 1: Personal/familiar topics (3-4 questions)
- Part 2: Cue cards with bullet points
- Part 3: Abstract discussion questions
Rate based on fluency, vocabulary, grammar, pronunciation.`
      },
      sat: {
        math: `Generate SAT Math questions. Include:
- Algebra and functions
- Problem solving and data analysis
- Advanced math (quadratics, polynomials)
- Geometry and trigonometry
Vary difficulty and include both multiple choice and grid-in formats.`,
        reading: `Generate SAT Reading questions. Include:
- Evidence-based reading comprehension
- Vocabulary in context
- Author's purpose and tone
- Data interpretation from passages
Include brief passage excerpts.`,
        writing: `Generate SAT Writing and Language questions. Include:
- Grammar and punctuation
- Expression of ideas
- Standard English conventions
- Sentence structure improvements`
      },
      toefl: {
        listening: `Generate TOEFL iBT Listening questions. Include:
- Academic lecture comprehension
- Campus conversation scenarios
- Detail and inference questions
- Speaker attitude/opinion questions`,
        reading: `Generate TOEFL iBT Reading questions. Include:
- Academic passage comprehension
- Vocabulary in context
- Reference questions
- Insert text questions
- Prose summary`,
        speaking: `Generate TOEFL iBT Speaking prompts. Include:
- Independent speaking (personal preference)
- Integrated speaking (reading + listening + speaking)
- Academic lecture summary tasks`,
        writing: `Generate TOEFL iBT Writing prompts. Include:
- Integrated writing (reading + listening + writing)
- Independent writing (agree/disagree essay)
Provide clear scoring rubrics.`
      },
      cefr: {
        reading: `Generate CEFR ${difficulty} level reading questions appropriate for ${difficulty === 'beginner' ? 'A1-A2' : difficulty === 'intermediate' ? 'B1-B2' : 'C1-C2'}. Include:
- Comprehension questions
- Vocabulary matching
- Gap-fill exercises
- True/False questions`,
        listening: `Generate CEFR ${difficulty} level listening questions appropriate for ${difficulty === 'beginner' ? 'A1-A2' : difficulty === 'intermediate' ? 'B1-B2' : 'C1-C2'}. Include:
- Dialogue comprehension
- Information extraction
- Note-taking practice`,
        speaking: `Generate CEFR ${difficulty} level speaking prompts appropriate for ${difficulty === 'beginner' ? 'A1-A2' : difficulty === 'intermediate' ? 'B1-B2' : 'C1-C2'}. Include:
- Self-introduction
- Picture description
- Role-play scenarios
- Discussion topics`,
        writing: `Generate CEFR ${difficulty} level writing prompts appropriate for ${difficulty === 'beginner' ? 'A1-A2' : difficulty === 'intermediate' ? 'B1-B2' : 'C1-C2'}. Include:
- Email writing
- Short essays
- Story continuation
- Formal/informal letter writing`
      }
    };

    const sectionPrompt = examPrompts[examType]?.[section] || 
      `Generate ${questionCount} practice questions for ${examType} ${section} section at ${difficulty} level.`;

    const systemPrompt = `You are an expert educational content creator specializing in standardized test preparation. Generate authentic practice questions that closely match real exam formats.

Your response must be a valid JSON array of question objects. Each object must have:
- "question_text": The question text (include any passage/context if needed)
- "question_type": One of: "multiple_choice", "fill_blank", "true_false", "essay", "speaking"
- "options": An array of option objects (for multiple choice), each with "id" (a, b, c, d) and "text"
- "correct_answer": The correct answer (option id for MC, text for fill_blank, true/false for T/F, or rubric for essay/speaking)
- "points": Points value (5-20 based on complexity)
- "explanation": Explanation of the correct answer
- "audio_context": (optional) Description of audio content for listening questions
- "passage": (optional) Reading passage for comprehension questions
- "rubric": (optional) Scoring criteria for essay/speaking questions

Return ONLY valid JSON array.`;

    const userPrompt = `${sectionPrompt}

Generate exactly ${questionCount} questions.
Difficulty: ${difficulty}
Format: Mix of question types appropriate for this section.

Return ONLY a valid JSON array, no additional text.`;

    console.log("Generating exam questions:", { examType, section, difficulty, questionCount });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the response
    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse questions from AI response");
    }

    // Validate and format questions
    const validatedQuestions = questions.map((q: any, index: number) => ({
      question_text: q.question_text || `Question ${index + 1}`,
      question_type: q.question_type || "multiple_choice",
      options: q.options || null,
      correct_answer: q.correct_answer || null,
      points: q.points || 10,
      explanation: q.explanation || "",
      audio_context: q.audio_context || null,
      passage: q.passage || null,
      rubric: q.rubric || null,
      order_index: index,
    }));

    console.log(`Generated ${validatedQuestions.length} exam questions successfully`);

    return new Response(
      JSON.stringify({ questions: validatedQuestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating exam questions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate questions" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
