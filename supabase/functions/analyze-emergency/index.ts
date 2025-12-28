import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emergencyDescription, emergencyType, hospitalName, hospitalSpecializations, queueLength, distance } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a medical emergency triage assistant. Your role is to:
1. Classify emergency types based on descriptions
2. Provide brief, helpful recommendations for hospital selection
3. Give clear, calm guidance to patients

Keep responses concise and professional. Do not provide medical diagnoses, only routing assistance.`;

    const userPrompt = `Emergency Description: ${emergencyDescription || 'Not provided'}
Selected Emergency Type: ${emergencyType}
Recommended Hospital: ${hospitalName}
Hospital Specializations: ${hospitalSpecializations?.join(', ') || 'General'}
Current Queue: ${queueLength} patients
Estimated Distance: ${distance?.toFixed(1)} km

Based on this information, provide:
1. A brief classification of the emergency severity (Critical/Urgent/Standard)
2. Why this hospital is a good match (1-2 sentences)
3. Any immediate safety advice while traveling (1 sentence)

Format your response as JSON with keys: severity, recommendation, advice`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service requires payment.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse as JSON, otherwise return raw content
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch {
      analysis = {
        severity: 'Standard',
        recommendation: content,
        advice: 'Stay calm and proceed safely to the hospital.'
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-emergency function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      analysis: {
        severity: 'Standard',
        recommendation: 'Hospital selected based on proximity and availability.',
        advice: 'Proceed safely to the hospital.'
      }
    }), {
      status: 200, // Return 200 with fallback to not break the flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
