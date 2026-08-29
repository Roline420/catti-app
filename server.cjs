// ==========================================
// CATTI 魔鬼考官 - 官方满血穿墙终极版 (server.cjs)
// ==========================================

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const fs = require('fs');
const path = require('path');

// 🛡️ 护城河：系统级免死金牌！拦截任何崩溃，保住服务器的命！
process.on('uncaughtException', (err) => {
  console.error("🚨 拦截到致命错误，系统免于崩溃:", err.message);
});

// 🚨 【全局穿墙术】：确保 Gemini 和 微软 TTS 全部走梯子！
const { setGlobalDispatcher, ProxyAgent } = require('undici');
const proxyUrl = 'http://127.0.0.1:7897'; // 你的梯子端口
const proxyAgent = new ProxyAgent(proxyUrl); 
setGlobalDispatcher(proxyAgent); 

// 💡 强制 Node.js 底层所有流量翻墙，防止微软 WebSocket 连不上！
process.env.http_proxy = proxyUrl;
process.env.https_proxy = proxyUrl;
process.env.all_proxy = proxyUrl;

const multer = require('multer');
const xlsx = require('xlsx');
const upload = multer({ storage: multer.memoryStorage() }); 
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

// 🔑 你的官方 Gemini 钥匙
const genAI = new GoogleGenerativeAI('AIzaSyASc-5xl4vZAbtcBIYUyvHh7IS3WGyl1-c');

// ==========================================
// 📝 接口 1：批改试卷
// ==========================================
app.post('/api/evaluate', async (req, res) => {
  try {
    const { prompt, userData } = req.body;
    const finalPrompt = `${prompt}\n\n【以下是考生的全部作答数据】：\n${userData}\n\n请严格按要求批改，并必须返回合法的纯 JSON 格式。`;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let aiResultText = "";
    const maxRetries = 3; // 👉 设置最大重试次数为 3 次

    // 👇 --- 开始重试机制循环 --- 👇
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\n📬 收到交卷请求，正在走梯子发给官方 Gemini 考官... (第 ${attempt} 次尝试)`);
        
        // 核心请求代码
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        
        aiResultText = result.response.text();
        console.log("✅ 官方 Gemini 批改完成！");
        
        break; // 💡 非常重要：一旦成功，马上 break 跳出 for 循环，不往后试了！

      } catch (apiError) {
        console.error(`❌ 第 ${attempt} 次请求报错：`, apiError.message);
        
        // 如果已经试了 3 次还是失败，就把错误抛给最外层，让前端知道彻底失败了
        if (attempt === maxRetries) {
          throw apiError; 
        }
        
        // 如果还没到 3 次，就等 3 秒（3000毫秒）再进入下一次循环
        console.log("⏳ 官方服务器可能太忙或网络抖动，等待 3 秒后自动重试...\n");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    // 👆 --- 结束重试机制循环 --- 👆

    // 格式化输出的 JSON 文本
    aiResultText = aiResultText.replace(/```json/gi, '').replace(/```/g, '').trim();
    res.json(JSON.parse(aiResultText));

  } catch (error) {
    // 这里的 catch 负责兜底，只要 3 次重试都失败了，就会走到这里
    console.error("🚫 批改彻底失败，重试次数已耗尽：", error.message);
    res.status(500).json({ error: 'AI 批改失败，服务器繁忙或梯子断开，请稍后再交卷！' });
  }
});

// ==========================================
// 🎤 接口 2：语音识别（听写）
// ==========================================
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType } = req.body;
    console.log("\n🎧 收到前端传来的录音，正在让 Gemini 听写...");
    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, "");
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = "你现在是一个精通中英双语的高级速记员。请精准听写出这段音频里的内容。核心要求：1. 必须根据说话人的停顿和语义，自动添加准确的标点符号。2. 只需要直接输出带标点的听写结果，绝对不要加任何前缀、解释或废话。3. 如果完全听不清，请返回“（未能识别到清晰语音）”。";
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType || "audio/webm", data: cleanBase64 } }
    ]);
    const transcribedText = result.response.text().trim();
    console.log("✅ Gemini 听写完成：", transcribedText);
    res.json({ text: transcribedText });
  } catch (error) {
    console.error("❌ 语音识别失败：", error.message);
    res.status(500).json({ error: 'AI 听写失败: ' + error.message });
  }
});

// ==========================================
// 💬 接口 3：与考官对质/答疑聊天
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { question, context } = req.body;
    console.log(`\n💬 收到考生申诉/提问：“${question}”`);
    const prompt = `你现在是一位权威、专业且耐心的 CATTI 阅卷考官。考生对你的批改有疑问，正在向你请教或“申诉”。\n【当前题目的上下文】：\n${context}\n\n【考生的疑问/申诉】：\n${question}\n请你以阅卷考官的口吻，专业、有理有据、且态度温和地解答考生的疑惑。`;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const replyText = result.response.text().trim();
    console.log("✅ 考官答复完毕！");
    res.json({ reply: replyText });
  } catch (error) {
    console.error("❌ 答疑失败：", error.message);
    res.status(500).json({ error: '考官网络开小差了，请检查梯子后重试！' });
  }
});

// ==========================================
// 📁 接口 4：智能解析术语文件 (Excel) + 自动加音标
// ==========================================
app.post('/api/upload-terms', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '没有收到文件' });
    console.log(`\n📥 收到术语文件: ${req.file.originalname}，正在请考官解析...`);
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; 
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    const textData = rawData.slice(0, 200).map(row => row.join(' | ')).join('\n');

    const prompt = `你是一个专业的术语整理大师。请从以下表格数据中，提取出所有的中英术语对。请根据含义归类，并务必为所有的英文术语（或英文释义）提供标准的国际音标（IPA）。
数据内容：\n${textData}\n
请务必严格返回一个纯 JSON 数组：
[
  { "term": "英文原词", "phonetic": "ɪŋɡlɪʃ", "definition": "中文释义", "category": "分类名称", "type": "en2zh" },
  { "term": "中文原词", "phonetic": "ɪŋɡlɪʃ", "definition": "英文释义", "category": "分类名称", "type": "zh2en" }
]`;
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    let aiResponse = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedTerms = JSON.parse(aiResponse);
    console.log(`✅ AI 成功解析出 ${parsedTerms.length} 个带音标的术语！`);
    res.json({ terms: parsedTerms });
  } catch (error) {
    console.error("❌ 文件解析失败：", error.message);
    res.status(500).json({ error: 'AI 解析文件失败，请检查网络或重试' });
  }
});

// ==========================================
// 🌟 接口 5：Azure 顶级神经网络语音免费合成接口 (完美驯服版)
// ==========================================
const voiceMap = {
  "us_male": "en-US-GuyNeural",       
  "us_female": "en-US-JennyNeural",   
  "uk_male": "en-GB-RyanNeural",      
  "uk_female": "en-GB-SoniaNeural",   
  "cn_male": "zh-CN-YunxiNeural",     
  "cn_female": "zh-CN-XiaoxiaoNeural" 
};

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    const edgeVoice = voiceMap[voiceId] || "en-US-AriaNeural"; 
    console.log(`\n🗣️ 正在走梯子向微软云请求真声录音: [${edgeVoice}]...`);

    const tts = new MsEdgeTTS();
    await tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const processedText = text
      .replace(/([.?!。？！])\s*/g, "$1 \n\n") 
      .replace(/([,;:\、，；：])\s*/g, "$1 \n");

    // 🔥 终极必杀技：既然它想要目录，我们就给它建一个真正的目录！
    const ttsDir = path.join(__dirname, `tts_temp_${Date.now()}`);
    if (!fs.existsSync(ttsDir)) {
      fs.mkdirSync(ttsDir); // 帮它建好“柜子”
    }

    // 把建好的目录传给它，它就会乖乖在里面生成 audio.mp3
    await tts.toFile(ttsDir, processedText);

    // 锁定它生成的真实文件的绝对路径
    const finalAudioPath = path.join(ttsDir, 'audio.mp3');
    console.log(`✅ 录音生成成功，正在发送给前端...`);

    // 把文件发给前端
    res.download(finalAudioPath, 'catti_exam.mp3', (err) => {
      // 发完立刻打扫战场，先删文件，再删目录
      try {
        if (fs.existsSync(finalAudioPath)) fs.unlinkSync(finalAudioPath);
        if (fs.existsSync(ttsDir)) fs.rmdirSync(ttsDir);
      } catch(e) { /* 静默处理 */ }
    });

  } catch (error) {
    console.error("🚨 TTS 生成失败 (已被护城河拦截):", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "语音合成失败，请检查梯子是否顺畅" });
    }
  }
});

// ==========================================
// 🚀 启动服务器
// ==========================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 CATTI 官方满血版后台已全部就绪！`);
  console.log(`📡 监听端口: [https://catti-app.vercel.app](https://catti-app.vercel.app)`);
  console.log(`=========================================`);
});