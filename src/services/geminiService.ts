import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with proper API key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBYItvAZK0uMpFxTy2NEmQXeO4G8cD3WIc';

// Validate API key on initialization
if (!API_KEY || API_KEY === 'your-api-key-here') {
  console.error('❌ Gemini API key is not configured properly');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AnalysisResult {
  summary: string;
  keywords: string[];
  markdownContent: string;
  inputContent: string;
  inputType: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async analyzeText(text: string, inputType: string = 'text', inputContent: string = ''): Promise<AnalysisResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required');
    }

    // Validate API key
    if (!API_KEY || API_KEY === 'your-api-key-here') {
      throw new Error('❌ Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    console.log('🚀 Starting analysis with Gemini API...');

    try {
      // Generate comprehensive analysis with markdown formatting
      const analysisPrompt = `
        Analyze the following text and provide a comprehensive analysis in markdown format:

        **Instructions:**
        1. Create a detailed summary (2-3 paragraphs)
        2. Extract 5-8 relevant keywords
        3. Format the entire response in clean, professional markdown
        4. Include sections for Summary, Key Points, Keywords, and Insights
        5. Use proper markdown headers, bullet points, and formatting
        6. Make it informative and well-structured

        **Text to analyze:**
        ${text}

        **Response format should be:**
        # Analysis Report

        ## Summary
        [Detailed summary here]

        ## Key Points
        - [Key point 1]
        - [Key point 2]
        - [etc.]

        ## Keywords
        [comma-separated keywords]

        ## Insights
        [Additional insights and observations]
      `;

      const result = await this.model.generateContent(analysisPrompt);
      const response = await result.response;
      const markdownContent = response.text();

      // Extract keywords from the markdown content
      const keywordsMatch = markdownContent.match(/## Keywords\s*\n([^\n#]+)/);
      const keywordsText = keywordsMatch ? keywordsMatch[1].trim() : '';
      const keywords = keywordsText
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .slice(0, 8);

      // Extract summary from the markdown content
      const summaryMatch = markdownContent.match(/## Summary\s*\n((?:[^\n#]|\n(?!#))+)/);
      const summary = summaryMatch ? summaryMatch[1].trim() : 'Analysis completed successfully.';

      return {
        summary,
        keywords,
        markdownContent,
        inputContent: inputContent || text.substring(0, 100) + '...',
        inputType
      };
    } catch (error: any) {
      console.error('❌ Gemini API error:', error);
      
      // Handle specific API errors
      if (error?.message?.includes('API_KEY_INVALID')) {
        throw new Error('❌ Invalid Gemini API key. Please check your API key configuration.');
      }
      if (error?.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('❌ API quota exceeded. Please check your Gemini API usage limits.');
      }
      if (error?.message?.includes('PERMISSION_DENIED')) {
        throw new Error('❌ Permission denied. Please check your API key permissions.');
      }
      
      throw new Error(`❌ Failed to analyze content: ${error?.message || 'Unknown error'}. Please check your API key and try again.`);
    }
  }

  async extractTextFromUrl(url: string): Promise<string> {
    try {
      // Validate URL format
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Please provide a valid HTTP or HTTPS URL');
      }

      // Use multiple CORS proxy options for better reliability
      const proxyOptions = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`
      ];

      let response;
      let data;

      // Try different proxy services
      for (const proxyUrl of proxyOptions) {
        try {
          response = await fetch(proxyUrl, {
            headers: {
              'User-Agent': 'LiteRead/1.0'
            }
          });
          
          if (response.ok) {
            if (proxyUrl.includes('allorigins')) {
              data = await response.json();
              if (data.contents) break;
            } else {
              data = { contents: await response.text() };
              break;
            }
          }
        } catch (proxyError) {
          console.warn(`Proxy ${proxyUrl} failed:`, proxyError);
          continue;
        }
      }

      if (!data || !data.contents) {
        throw new Error('Unable to fetch content from the URL. The website might be blocking requests or require authentication.');
      }

      const html = data.contents;

      // Extract text content from HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Remove script and style elements
      const scripts = doc.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      // Get text content
      let text = doc.body?.textContent || doc.textContent || '';
      
      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();
      
      // Limit text length
      if (text.length > 15000) {
        text = text.substring(0, 15000);
      }

      if (text.length < 100) {
        throw new Error('Not enough text content found on the page');
      }

      return text;
    } catch (error) {
      console.error('URL extraction error:', error);
      throw new Error('Failed to extract content from URL. Please check if the URL is accessible.');
    }
  }

  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Handle PDF files
      if (file.type === 'application/pdf') {
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = await this.extractTextFromPDF(arrayBuffer);
            resolve(text);
          } catch (error) {
            reject(new Error('Failed to extract text from PDF. Please try a different file.'));
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }
      
      // Handle Word documents
      if (file.type.includes('word') || file.name.endsWith('.docx')) {
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const text = await this.extractTextFromWord(arrayBuffer);
            resolve(text);
          } catch (error) {
            reject(new Error('Failed to extract text from Word document. Please try a different file.'));
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      // Handle text files
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content || content.trim().length === 0) {
          reject(new Error('File appears to be empty or unreadable'));
          return;
        }
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read the file'));
      };

      reader.readAsText(file);
    });
  }

  private async extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // Dynamic import for PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to first 10 pages
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      if (fullText.trim().length < 50) {
        throw new Error('Not enough text content found in PDF');
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private async extractTextFromWord(arrayBuffer: ArrayBuffer): Promise<string> {
    try {
      // Dynamic import for mammoth
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      if (!result.value || result.value.trim().length < 50) {
        throw new Error('Not enough text content found in Word document');
      }

      return result.value.trim();
    } catch (error) {
      console.error('Word extraction error:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }
}

export const geminiService = new GeminiService();
