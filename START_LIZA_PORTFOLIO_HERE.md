# ⚡ LIZA Portfolio - START HERE (3 Commands)

**Ready in: 10 minutes**

---

## 🎯 3 Simple Steps to Deploy

### Step 1: TEST LOCALLY (5 min)
```bash
bun test-portfolio-analytics.ts
```

**What to see:**
```
🧪 Testing Portfolio Analytics Feature

✅ Portfolio fetched successfully!

💼 **PORTFOLIO ANALYSIS**
📍 Wallet: CMVrzd...
💰 **Total Value: $XXX.XX**
📊 Tokens Held: X

[portfolio breakdown]

✅ Test completed successfully!
```

**If you see this:** ✅ PERFECT! Continue to Step 2.

---

### Step 2: TEST IN LIZA (5 min)
```bash
bun run dev
```

**In the chat, type:**
```
show my portfolio
```

**What LIZA should say:**
```
💼 **PORTFOLIO ANALYSIS**
📍 Wallet: CMVrzd...
💰 **Total Value: $XXX.XX**
...
```

**If LIZA responds:** ✅ PERFECT! Continue to Step 3.

---

### Step 3: DEPLOY (1 min)
```bash
git add .
git commit -m "Add Portfolio Analytics to LIZA"
git push
```

**Vercel will auto-deploy in 2-3 minutes.**

**Check:** https://shina-...vercel.app → See portfolio feature! ✅

---

## 🎉 Done!

Your LIZA now has Portfolio Analytics! 🤖

---

## 📚 Need More Info?

- **Questions?** → Read: `LIZA_COMPLETE_SUMMARY.md`
- **All commands?** → Read: `LIZA_QUICK_COMMANDS_REFERENCE.md`
- **Feature roadmap?** → Read: `LIZA_EASY_FEATURES_TO_ADD.md`
- **Troubleshooting?** → Read: `PORTFOLIO_ANALYTICS_SETUP.md`
- **Complete guide?** → Read: `LIZA_IMPLEMENTATION_COMPLETE.md`
- **Index of all?** → Read: `LIZA_FEATURES_DOCUMENTATION_INDEX.md`

---

## ⚠️ If Something Goes Wrong

### Problem: Test fails
```bash
# Try this:
bun run build
bun test-portfolio-analytics.ts
```

Check: `PORTFOLIO_ANALYTICS_SETUP.md` for troubleshooting.

### Problem: LIZA doesn't respond
```bash
# Make sure it's running:
bun run dev

# Check you typed correctly:
"show my portfolio"
```

### Problem: Deploy fails
```bash
# Check git status:
git status

# Make sure everything is committed:
git add .
git commit -m "Add Portfolio"
git push
```

---

## ✅ Checklist

- [ ] Run: `bun test-portfolio-analytics.ts` → SUCCESS
- [ ] Run: `bun run dev` → Works
- [ ] Try: "show my portfolio" → Responds
- [ ] Run: `git push` → Deploys
- [ ] Check: Website works ✅

---

## 🚀 Ready?

### RUN THIS NOW:

```bash
bun test-portfolio-analytics.ts
```

**If it works:** Continue to Step 2!  
**If it fails:** Check `PORTFOLIO_ANALYTICS_SETUP.md`

---

**Questions? Have questions, read any of the guides!**

Good luck! 🎉
