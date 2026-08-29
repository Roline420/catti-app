// 文件路径：你的项目根目录/api/gemini.js

export default async function handler(req, res) {
  // 1️⃣ 处理跨域 (让你的本地 localhost 也能测试)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { prompt, userData } = req.body;
    
    // 2️⃣ 从 Vercel 环境变量拿 Key
    const apiKey = process.env.GEMINI_API_KEY; 

    // 使用 Gemini 3.6 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
    const finalPrompt = `${prompt}\n\n【以下是考生的全部作答数据】：\n${userData}\n\n请严格按要求批改，并必须返回合法的纯 JSON 格式。`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google API 报错: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    let aiText = data.candidates[0].content.parts[0].text;
    aiText = aiText.replace(/```json/gi, '').replace(/```/g, '').trim();

    // 3️⃣ 返回给前端
    res.status(200).json(JSON.parse(aiText));

  } catch (error) {
    res.status(500).json({ error: "AI 批改失败", real_reason: error.message });
  }
}