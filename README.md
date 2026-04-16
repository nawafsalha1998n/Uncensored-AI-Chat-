# 🤖 AI Uncensored Pro - دردشة ذكاء اصطناعي بدون قيود

منصة متقدمة للدردشة مع الذكاء الاصطناعي وتوليد الصور والفيديوهات، مخصصة للبالغين فقط (+18). الموقع يسمح بالمحتوى الحساس والنقاشات غير المقيدة.

## ✨ الميزات الجديدة (التحديث الأخير)
- **🎬 Veo 3.1 Fast**: دمج أحدث موديلات الفيديو من Google لتوليد مقاطع سينمائية.
- **🖼️ Flux.1 Pro & SD3**: دعم موديلات الصور الأكثر تقدماً عبر Together.ai.
- **👤 شخصيات الذكاء الاصطناعي**: اختر بين (المفكر، الخبير، العبقري، المرح) أو الوضع غير المقيد.
- **📱 واجهة Sora2**: تصميم ثابت (Sticky) يسهل التصفح مع ميزة معاينة وتكبير الوسائط.
- **📥 تحميل مباشر**: زر لتحميل الصور والفيديوهات المنشأة مباشرة لجهازك.
- **📜 سجل المحادثات**: شريط جانبي لمتابعة وإدارة محادثاتك السابقة.

## 🔑 دليل مفاتيح API (Environment Variables)

يجب إضافة هذه المفاتيح في إعدادات **Vercel** ليعمل الموقع بكامل طاقته:

| الخدمة | الموقع لجلب المفتاح | المتغير في Vercel | الوظيفة |
| :--- | :--- | :--- | :--- |
| **Google Gemini** | [Google AI Studio](https://aistudio.google.com/) | `GEMINI_API_KEY` | فيديو (Veo 3.1) ودردشة متقدمة |
| **Together.ai** | [together.ai](https://together.ai/) | `TOGETHER_API_KEY` | صور (Flux.1 Pro, SD3) |
| **Fal.ai** | [fal.ai](https://fal.ai/) | `FAL_AI_KEY` | بديل فيديو وصور |
| **Groq** | [Groq Console](https://console.groq.com/) | `GROQ_API_KEY` | دردشة سريعة جداً |
| **Clerk** | [Clerk Dashboard](https://clerk.com/) | `CLERK_SECRET_KEY` | نظام تسجيل الدخول |
| **Database** | **Vercel Postgres** | `DATABASE_URL` | حفظ السجل والوسائط |

### 💡 كيف تحصل على GEMINI_API_KEY لـ Veo 3.1؟
1. اذهب إلى [Google AI Studio](https://aistudio.google.com/).
2. اضغط على **"Get API key"** في القائمة الجانبية.
3. قم بإنشاء مفتاح جديد (**Create API key in new project**).
4. انسخ المفتاح وضعه في Vercel باسم `GEMINI_API_KEY`.

## 🏗️ البنية المعمارية المحدثة
```
project_uncensored/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # يدعم الشخصيات (المفكر، الخبير، إلخ)
│   │   ├── generate-image/route.ts # يدعم Flux Pro و Pollinations المجاني
│   │   └── generate-video/route.ts # يدعم Veo 3.1 Fast و Fal.ai
├── components/
│   ├── chat/ChatInterface.tsx      # واجهة Sora2 الثابتة مع المعاينة والتحميل
│   ├── ModelSelector.tsx           # منتقي الأوضاع
├── lib/
│   ├── ai.ts                       # إعدادات الموديلات والشخصيات
├── prisma/
│   └── schema.prisma               # قاعدة بيانات تدعم السجل والملفات
```

## 🔐 الأمان والخصوصية
- ✅ جميع الطلبات محمية بمصادقة Clerk.
- ✅ التحقق من العمر (18+) إلزامي.
- ✅ لا يتم حفظ بيانات حساسة.
- ✅ دعم كامل للمحتوى غير المقيد للبالغين.

---
**ملاحظة**: هذا الموقع مخصص للبالغين فقط (+18) ويحتوي على محتوى قد يكون حساساً. استخدمه بمسؤولية.
🌍 تم التطوير بواسطة Manus AI.
