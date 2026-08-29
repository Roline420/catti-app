// 文件路径：你的项目根目录/api/tts.js

const { MsEdgeTTS, OUTPUT_FORMAT } = require("msedge-tts");
const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { text, voiceId } = req.body;
    
    const voiceMap = {
      "us_male": "en-US-GuyNeural",       
      "us_female": "en-US-JennyNeural",   
      "uk_male": "en-GB-RyanNeural",      
      "uk_female": "en-GB-SoniaNeural",   
      "cn_male": "zh-CN-YunxiNeural",     
      "cn_female": "zh-CN-XiaoxiaoNeural" 
    };
    const edgeVoice = voiceMap[voiceId] || "en-US-AriaNeural"; 

    const tts = new MsEdgeTTS();
    await tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const processedText = text
      .replace(/([.?!。？！])\s*/g, "$1 \n\n") 
      .replace(/([,;:\、，；：])\s*/g, "$1 \n");

    // 🌟 Vercel 云端专属：只能在 /tmp 目录下创建临时文件
    const ttsDir = path.join('/tmp', `tts_temp_${Date.now()}`);
    if (!fs.existsSync(ttsDir)) {
      fs.mkdirSync(ttsDir);
    }

    await tts.toFile(ttsDir, processedText);
    const finalAudioPath = path.join(ttsDir, 'audio.mp3');

    const audioBuffer = fs.readFileSync(finalAudioPath);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.status(200).send(audioBuffer);

    try {
      if (fs.existsSync(finalAudioPath)) fs.unlinkSync(finalAudioPath);
      if (fs.existsSync(ttsDir)) fs.rmdirSync(ttsDir);
    } catch(e) { }

  } catch (error) {
    res.status(500).json({ error: "语音合成失败，请检查云端配置" });
  }
}