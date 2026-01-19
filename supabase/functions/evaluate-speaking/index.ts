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
    const { transcript, prompt, examType = "ielts" } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const examCriteria: Record<string, string> = {
      ielts: `Evaluate this IELTS Speaking response using the official band descriptors:
- Fluency and Coherence (0-9): Natural flow, logical organization, appropriate use of connectors
- Lexical Resource (0-9): Range of vocabulary, accuracy, appropriateness
- Grammatical Range and Accuracy (0-9): Variety of structures, error frequency
- Pronunciation (0-9): Intelligibility, stress, rhythm, intonation

Calculate an overall band score (average of all criteria, rounded to nearest 0.5).`,
      toefl: `Evaluate this TOEFL Speaking response using the official scoring rubric (0-4 scale):
- Delivery: Clear, fluid speech with good pronunciation
- Language Use: Effective vocabulary and grammar
- Topic Development: Fully addresses the task with coherent ideas

Convert to 0-30 scaled score.`,
      cefr: `Evaluate this response according to CEFR levels (A1-C2):
- Range: Vocabulary and structure variety
- Accuracy: Grammatical and lexical accuracy
- Fluency: Smooth flow without excessive hesitation
- Interaction: Appropriateness and coherence
- Coherence: Logical organization

Assign a CEFR level (A1, A2, B1, B2, C1, or C2).`
    };

    const systemPrompt = `You are an expert language examiner with years of experience evaluating speaking tests. Provide detailed, constructive feedback.

${examCriteria[examType] || examCriteria.ielts}

Your response must be valid JSON with this structure:
{
  "overall_score": number or string (band score/CEFR level),
  "criteria_scores": {
    "criterion_name": {
      "score": number,
      "feedback": "specific feedback"
    }
  },
  "strengths": ["list of 2-3 specific strengths"],
  "improvements": ["list of 2-3 specific areas to improve"],
  "sample_corrections": ["1-2 corrected versions of any errors"],
  "detailed_feedback": "2-3 sentence overall summary",
  "estimated_time_to_improve": "e.g., '2-4 weeks of focused practice'"
}`;

    const userPrompt = `Speaking Prompt: ${prompt}

Student's Transcribed Response:
"${transcript}"

Evaluate this response and provide detailed scoring and feedback. Return ONLY valid JSON.`;

    console.log("Evaluating speaking response for:", examType);

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
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

    // Parse the evaluation
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        evaluation = JSON.parse(content);
      }
    } catch (parseError) {
      console.error("Failed to parse evaluation:", content);
      // Return a default evaluation structure
      evaluation = {
        overall_score: examType === "ielts" ? 5.0 : examType === "cefr" ? "B1" : 15,
        criteria_scores: {},
        strengths: ["Response was provided"],
        improvements: ["Unable to fully analyze - try again"],
        sample_corrections: [],
        detailed_feedback: "Please try again for a full evaluation.",
        estimated_time_to_improve: "N/A"
      };
    }

    console.log("Speaking evaluation completed");

    return new Response(
      JSON.stringify({ evaluation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error evaluating speaking:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to evaluate" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
