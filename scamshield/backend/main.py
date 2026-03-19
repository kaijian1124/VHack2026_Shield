from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from supabase import create_client
from dotenv import load_dotenv
import os
import json

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
supabase = create_client(os.getenv("EXPO_PUBLIC_SUPABASE_URL"), os.getenv("EXPO_PUBLIC_SUPABASE_KEY"))

SYSTEM_PROMPT = """You are a Malaysian anti-fraud expert specializing in phone scam detection. 
You have deep knowledge of common scams in Malaysia including:
- Macau scams (impersonating police/banks)
- Parcel scams (fake customs fees)
- Love scams
- Investment scams
- LHDN/SSM impersonation scams

Analyze the given conversation transcript and return ONLY a valid JSON object with this exact structure:
{
  "score": <integer 0-100>,
  "risk_level": <"Low" | "Medium" | "High">,
  "reasons": [<list of strings explaining why>],
  "patterns_detected": [<list of scam pattern names detected>],
  "recommendation": <string with advice in English>
}

Scoring guide:
- 0-30: Low risk, likely legitimate call
- 31-60: Medium risk, suspicious elements present
- 61-100: High risk, strong scam indicators

Return ONLY the JSON object, no other text."""

class AnalyzeRequest(BaseModel):
    transcript: str
    caller_number: str = None

class AnalyzeResponse(BaseModel):
    score: int
    risk_level: str
    reasons: list
    patterns_detected: list
    recommendation: str

@app.get("/")
def root():
    return {"status": "ScamShield API is running"}

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    if not request.transcript or len(request.transcript.strip()) < 10:
        raise HTTPException(status_code=400, detail="Transcript too short")

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this call transcript:\n\n{request.transcript}"}
            ],
            temperature=0.0,
            max_tokens=1000,
        )

        result_text = response.choices[0].message.content.strip()
        result = json.loads(result_text)

        # Save to Supabase (NO transcript stored — privacy first)
        supabase.table("scam_logs").insert({
            "score": result["score"],
            "risk_level": result["risk_level"].lower(),
            "reasons": result["reasons"],
            "patterns_detected": result["patterns_detected"],
            "recommendation": result["recommendation"],
            "caller_number": request.caller_number,
        }).execute()

        return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def history():
    try:
        response = supabase.table("scam_logs")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(50)\
            .execute()
        return {"logs": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))