from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
import time
from collections import defaultdict
import os
from dotenv import load_dotenv
from openai import OpenAI
import json
from typing import List

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Rate limiting
rate_limiter = defaultdict(list)

class UrlRequest(BaseModel):
    url: str

class ScrapeResponse(BaseModel):
    url: str
    title: str
    content: str
    word_count: int

class SummarizeRequest(BaseModel):
    content: str
    title: str

class SummarizeResponse(BaseModel):
    summary: List[str]

def is_valid_url(url: str) -> str:
    """Validate and clean URL"""
    if not url or not url.strip():
        raise ValueError("URL cannot be empty")
    
    url = url.strip()
    
    # Add https if no protocol
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    try:
        parsed = urlparse(url)
        if not parsed.netloc:
            raise ValueError("Invalid URL format")
        
        # Block localhost
        if 'localhost' in parsed.netloc.lower() or '127.0.0' in parsed.netloc:
            raise ValueError("Localhost URLs not allowed")
            
        return url
    except Exception:
        raise ValueError("Invalid URL format")

def check_rate_limit(client_ip: str) -> bool:
    """Simple rate limiting - 5 requests per minute"""
    now = time.time()
    minute_ago = now - 60
    
    # Clean old requests
    rate_limiter[client_ip] = [req_time for req_time in rate_limiter[client_ip] if req_time > minute_ago]
    
    # Check limit
    if len(rate_limiter[client_ip]) >= 5:
        return False
    
    rate_limiter[client_ip].append(now)
    return True

def extract_text(html_content: str) -> tuple[str, str]:
    """Extract title and text from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Remove unwanted elements
    for element in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'meta']):
        element.decompose()
    
    # Get title
    title_tag = soup.find('title')
    title = title_tag.get_text().strip() if title_tag else "No title found"
    
    # Get main content
    main_content = soup.find('main') or soup.find('article') or soup.find('body') or soup
    
    # Extract text from paragraphs and headings
    text_elements = main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'div'])
    
    if text_elements:
        texts = []
        for elem in text_elements:
            text = elem.get_text().strip()
            if text and len(text) > 10:  # Filter out very short text
                texts.append(text)
        content = '\n\n'.join(texts)
    else:
        content = main_content.get_text()
    
    # Clean up text
    content = re.sub(r'\n{3,}', '\n\n', content)  # Remove excessive newlines
    content = re.sub(r'[ \t]+', ' ', content)     # Normalize spaces
    content = content.strip()
    
    # Limit length
    if len(content) > 20000:
        content = content[:20000] + "\n\n[Content truncated...]"
    
    return title, content

@app.post("/api/scrape", response_model=ScrapeResponse)
async def scrape_website(request: UrlRequest):
    """Scrape text from a website"""
    
    # Rate limiting (simplified - using a fixed IP for demo)
    if not check_rate_limit("demo"):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")
    
    try:
        # Validate URL
        clean_url = is_valid_url(request.url)
        
        # Make request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(clean_url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Check if it's HTML
        content_type = response.headers.get('content-type', '').lower()
        if 'text/html' not in content_type:
            raise HTTPException(status_code=400, detail="URL does not return HTML content")
        
        # Extract text
        title, content = extract_text(response.text)
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="No readable content found")
        
        word_count = len(content.split())
        
        return ScrapeResponse(
            url=clean_url,
            title=title,
            content=content,
            word_count=word_count
        )
        
    except requests.RequestException as e:
        if isinstance(e, requests.Timeout):
            raise HTTPException(status_code=408, detail="Request timeout")
        elif isinstance(e, requests.ConnectionError):
            raise HTTPException(status_code=503, detail="Cannot connect to website")
        else:
            raise HTTPException(status_code=503, detail="Network error")
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/summarize", response_model=SummarizeResponse)
async def summarize_content(request: SummarizeRequest):
    """Summarize webpage content using OpenAI"""
    
    if not openai_client.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    try:
        # Limit content length to avoid token limits
        content = request.content[:8000] if len(request.content) > 8000 else request.content
        
        prompt = f"""Analyze and summarize the following webpage content into a comprehensive overview suitable for government briefing analysis. Provide 3-5 detailed paragraphs covering:

1. Core subject matter and key findings/conclusions
2. Relevant stakeholders, organizations, or entities involved
3. Policy implications, regulatory context, or governance aspects
4. Economic, social, or operational impacts discussed
5. Any data, statistics, or evidence presented

Focus on extracting information that would be valuable for policy analysis, strategic planning, and contextual understanding. Write in clear, professional prose suitable for briefing documents. Return only the summary text, no additional formatting.

Title: {request.title}

Content: {content}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,  # Increased for paragraph format
            temperature=0.2,  # Lower for more consistent analytical tone
        )
        
        summary_text = response.choices[0].message.content
        if not summary_text:
            raise HTTPException(status_code=500, detail="No summary generated")
        
        # Return as single summary text wrapped in array for API consistency
        return SummarizeResponse(summary=[summary_text.strip()])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)