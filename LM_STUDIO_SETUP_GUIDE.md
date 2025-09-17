# LM Studio Setup Guide for TradingAgents

## 🚀 **Quick Setup (10 minutes)**

### **Step 1: Download LM Studio**
1. Go to: **https://lmstudio.ai/**
2. Click **"Download for Windows"** (free)
3. Install the application

### **Step 2: Download a Model**
1. Open LM Studio
2. Click **"Discover"** tab
3. **Recommended models for TradingAgents:**

#### **🟢 BEST FOR BEGINNERS: Llama 3.2 3B Instruct**
   - Search: `"llama-3.2-3b-instruct"`
   - Size: ~2.2GB
   - Speed: Very fast
   - Quality: Good for analysis

#### **🟡 BETTER QUALITY: Llama 3.1 8B Instruct**  
   - Search: `"llama-3.1-8b-instruct"`
   - Size: ~4.7GB  
   - Speed: Moderate
   - Quality: Excellent for trading analysis

#### **🔴 BEST QUALITY: Qwen 2.5 14B Instruct** (if you have 16GB+ RAM)
   - Search: `"qwen2.5-14b-instruct"`
   - Size: ~8.2GB
   - Speed: Slower
   - Quality: Professional-grade analysis

4. Click **"Download"** on your chosen model

### **Step 3: Start the Server**
1. Click **"Local Server"** tab in LM Studio
2. Select your downloaded model
3. **IMPORTANT**: Set port to `1234` (already configured in your .env)
4. Click **"Start Server"**
5. You should see: `"Server started on http://localhost:1234"`

### **Step 4: Test the Connection**
Open a new PowerShell terminal and run:

```powershell
curl -X POST "http://localhost:1234/v1/chat/completions" -H "Content-Type: application/json" -d '{
  "model": "your-model-name",
  "messages": [{"role": "user", "content": "Hello"}],
  "max_tokens": 50
}'
```

If working, you'll get a JSON response with the AI's reply.

### **Step 5: Verify TradingAgents Connection**
Your TradingAgents system is already configured to connect to LM Studio at `http://192.168.0.33:1234` (from your .env file).

Visit: **http://localhost:3000** → Go to **"Asset Analysis"** tab → Try the "Batch Analysis" button.

---

## ⚙️ **Configuration Details**

### **Your Current .env Settings:**
```bash
LM_STUDIO_HOST=192.168.0.33  # Your local IP
LM_STUDIO_PORT=1234          # Standard LM Studio port
```

### **If You Get Connection Issues:**
1. **Check Windows Firewall**: Allow LM Studio through firewall
2. **Try localhost**: Change `LM_STUDIO_HOST=localhost` in `.env`
3. **Check IP**: Run `ipconfig` to verify your IP is `192.168.0.33`

---

## 🎯 **Model Recommendations by Use Case**

### **For Testing (Llama 3.2 3B)**
- ✅ Fast responses
- ✅ Low memory usage (~4GB RAM)
- ✅ Good for basic trading insights

### **For Production (Llama 3.1 8B)**
- ✅ Better reasoning
- ✅ More detailed analysis  
- ✅ Better at financial concepts
- ⚠️ Needs ~8GB RAM

### **For Professional Use (Qwen 2.5 14B)**
- ✅ Excellent reasoning
- ✅ Professional-grade analysis
- ✅ Complex financial modeling
- ⚠️ Needs ~16GB RAM

---

## 🐛 **Troubleshooting**

### **LM Studio Won't Start:**
- Restart LM Studio as Administrator
- Check antivirus isn't blocking it
- Ensure port 1234 isn't in use

### **Model Takes Forever to Load:**
- Try a smaller model (3B instead of 8B)
- Check available RAM
- Close other applications

### **TradingAgents Can't Connect:**
- Verify LM Studio server is running
- Check the green "Server Running" indicator
- Test with curl command above

---

## ✅ **Success Indicators**

You'll know it's working when:
1. **LM Studio shows**: "Server started on http://localhost:1234"
2. **TradingAgents web UI**: Shows LM Studio as "Connected" ✅ 
3. **Analysis works**: "Batch Analysis" button produces AI insights

---

**🎉 Once set up, you'll have a completely FREE local AI system for crypto trading analysis!**