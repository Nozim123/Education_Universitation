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
    const { category, difficulty, questionCount = 5 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert quiz generator for an educational platform. Generate quiz questions that are engaging, educational, and appropriately challenging.

Your response must be a valid JSON array of question objects. Each object must have:
- "question_text": The question text
- "options": An array of 4 option objects, each with "id" (a, b, c, d) and "text"
- "correct_option_id": The id of the correct option (a, b, c, or d)
- "points": Points for this question (10-50 based on difficulty)
- "explanation": A brief explanation of why the correct answer is correct

Example format:
[
  {
    "question_text": "What is the capital of France?",
    "options": [
      {"id": "a", "text": "London"},
      {"id": "b", "text": "Paris"},
      {"id": "c", "text": "Berlin"},
      {"id": "d", "text": "Madrid"}
    ],
    "correct_option_id": "b",
    "points": 10,
    "explanation": "Paris has been the capital of France since the 10th century."
  }
]`;

    const userPrompt = `Generate ${questionCount} quiz questions about "${category || 'general knowledge'}".
Difficulty level: ${difficulty || 'intermediate'}

Requirements:
- Questions should be clear and unambiguous
- All 4 options should be plausible
- Only one correct answer per question
- Points should reflect difficulty (easy: 10-20, intermediate: 20-35, hard: 35-50)

Return ONLY a valid JSON array, no additional text.`;

    console.log("Generating quiz questions for:", { category, difficulty, questionCount });

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
        temperature: 0.7,
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

    console.log("AI response received, parsing...");

    // Parse the JSON from the response (handle potential markdown code blocks)
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
      throw new Error("Failed to parse quiz questions from AI response");
    }

    // Validate and sanitize questions
    const validatedQuestions = questions.map((q: any, index: number) => ({
      question_text: q.question_text || `Question ${index + 1}`,
      options: q.options || [],
      correct_option_id: q.correct_option_id || "a",
      points: q.points || 20,
      explanation: q.explanation || "",
      order_index: index,
    }));

    console.log(`Generated ${validatedQuestions.length} questions successfully`);

    return new Response(
      JSON.stringify({ questions: validatedQuestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate quiz" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
