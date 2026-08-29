// 文件路径：你的项目根目录/api/transcribe.js

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
    if (req.method === 'OPTIONS') {
      res.status(200).end(); return;
    }
  
    try {
      const { audioBase64, mimeType } = req.body;
      const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
      const apiKey = process.env.GEMINI_API_KEY; 
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
      const prompt = "你现在是一个精通中英双语的高级速记员。请精准听写出这段音频里的内容。核心要求：1. 必须根据说话人的停顿和语义，自动添加准确的标点符号。2. 只需要直接输出带标点的听写结果，绝对不要加任何前缀、解释或废话。3. 如果完全听不清，请返回“（未能识别到清晰语音）”。";
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: prompt },
              { inlineData: { mimeType: mimeType || "audio/webm", data: cleanBase64 } }
            ]
          }]
        })
      });
  
      const data = await response.json();
      const transcribedText = data.candidates[0].content.parts[0].text.trim();
      res.status(200).json({ text: transcribedText });
    } catch (error) {
      res.status(500).json({ error: 'AI 听写失败: ' + error.message });
    }
  }