import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `אתה מומחה אופנה ובגדים. תפקידך לנתח תמונות של פריטי לבוש ולספק מידע מדויק.
ענה בעברית בפורמט JSON בלבד (בלי markdown) עם השדות הבאים:
{
  "title": "שם הפריט (למשל: חולצת טי שחורה)",
  "description": "תיאור מפורט של הפריט כולל צבע, סגנון, חומר משוער",
  "category": "אחד מ: חולצה, מכנסיים, שמלה וחצאית, נעליים, בגדי חורף, בגדי ים, אקססוריז, שקיות ותיקים, אחר",
  "condition": "אחד מ: חדש עם תווית, כמו חדש, משומש במצב טוב, משומש",
  "brand": "שם המותג אם ניתן לזהות, אחרת ריק",
  "gender": "אחד מ: male, female, unisex",
  "verified": true/false (האם הפריט נראה אותנטי ותואם לפריט לבוש אמיתי)
}`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'נתח את הפריט בתמונה וספק את כל הפרטים.' },
              { type: 'image_url', image_url: { url: imageBase64 } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'יותר מדי בקשות, נסו שוב בעוד רגע' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'נדרש חידוש קרדיטים' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON response from AI
    let parsed;
    try {
      // Remove potential markdown code block wrapping
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', content);
      parsed = { description: content, verified: false };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-item:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
