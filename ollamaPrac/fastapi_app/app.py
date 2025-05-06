
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import json
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://host.docker.internal:11434")

app = FastAPI()

class GenerateRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate(request: GenerateRequest):
    try:
        response = requests.post(
    f"{OLLAMA_URL}/api/generate",
    json={"model": "tinyllama", "prompt": request.prompt},
    headers={"Content-Type": "application/json"}
)
        response.raise_for_status()  # Raises HTTPError for bad responses
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {e}")

    try:
        text = response.text

        full_response = ""

        # Iterate over each line in the data
        for line in text.splitlines():
            # Parse the JSON object
            obj = json.loads(line)
            # Append the "response" field to the full response
            full_response += obj["response"]
            # Check if this is the final part of the response
            if obj.get("done", False):
                break

        # Print the complete response
        return full_response


    except requests.exceptions.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON response received")