# 🤖 AI Uncensored Chat - دردشة ذكاء اصطناعي بدون قيود

منصة متقدمة للدردشة مع الذكاء الاصطناعي وتوليد الصور والفيديوهات، مخصصة للبالغين فقط (+18). الموقع يسمح بالمحتوى الحساس والنقاشات غير المقيدة.

## ✨ الميزات الرئيسية

- **💬 دردشة متقدمة**: استخدام نماذج Groq المتعددة (Llama 3.3 70B، Mixtral، Gemma 2)
- **🖼️ توليد صور احترافية**: استخدام FLUX.1 من Together.ai (10 صور يومياً)
- **🎬 توليد فيديوهات**: استخدام Fast Video من Fal.ai (3 فيديوهات يومياً)
- **🔐 مصادقة آمنة**: تكامل كامل مع Clerk للمصادقة
- **👤 التحقق من العمر**: نظام تحقق من أن المستخدم بالغ (18+)
- **💾 حفظ المحادثات**: تخزين كامل لسجل المحادثات في قاعدة البيانات
- **🎨 واجهة احترافية**: تصميم عصري وسلس مع Tailwind CSS

## 🚀 البدء السريع

### المتطلبات

- Node.js 18+
- pnpm أو npm
- حساب Vercel (اختياري للنشر)

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/nawafsalha1998n/Uncensored-AI-Chat-
cd Uncensored-AI-Chat-

# تثبيت التبعيات
pnpm install

# إنشاء ملف .env.local
cp .env.example .env.local
```

### إضافة مفاتيح API

قم بتحرير ملف `.env.local` وأضف المفاتيح التالية:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
CLERK_SECRET_KEY=your_key_here

# Groq (للدردشة)
GROQ_API_KEY=your_key_here

# Together.ai (للصور)
TOGETHER_API_KEY=your_key_here

# Fal.ai (للفيديوهات)
FAL_AI_KEY=your_key_here

# قاعدة البيانات
DATABASE_URL=your_postgresql_url
```

### التشغيل المحلي

```bash
# تشغيل خادم التطوير
pnpm dev

# الدخول إلى http://localhost:3000
```

## 🔑 الحصول على مفاتيح API المجانية

### 1. **Clerk** (المصادقة)
- اذهب إلى [clerk.com](https://clerk.com)
- أنشئ حساب جديد
- أنشئ تطبيق جديد
- انسخ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` و `CLERK_SECRET_KEY`

### 2. **Groq** (الدردشة النصية)
- اذهب إلى [console.groq.com](https://console.groq.com)
- سجل دخول أو أنشئ حساب
- انتقل إلى "API Keys"
- أنشئ مفتاح API جديد
- **حد يومي**: 14,400 طلب يومياً (مجاني)

### 3. **Together.ai** (توليد الصور)
- اذهب إلى [together.ai](https://www.together.ai)
- أنشئ حساب جديد
- انتقل إلى "API Keys"
- أنشئ مفتاح API جديد
- **حد يومي**: 100 صورة يومياً (مجاني)

### 4. **Fal.ai** (توليد الفيديوهات)
- اذهب إلى [fal.ai](https://www.fal.ai)
- أنشئ حساب جديد
- انتقل إلى "API Keys"
- أنشئ مفتاح API جديد
- **حد يومي**: 20 فيديو يومياً (مجاني)

### 5. **قاعدة البيانات** (PostgreSQL)
- استخدم **Vercel Postgres** (مجاني):
  - اذهب إلى [vercel.com](https://vercel.com)
  - أنشئ مشروع جديد
  - أضف قاعدة بيانات PostgreSQL
  - انسخ رابط الاتصال

- أو استخدم **Supabase** (مجاني):
  - اذهب إلى [supabase.com](https://supabase.com)
  - أنشئ مشروع جديد
  - انسخ رابط الاتصال

## 📊 حدود الاستخدام اليومية

| الخدمة | الحد اليومي | الخطة |
|--------|-----------|------|
| الدردشة | 14,400 طلب | Groq مجاني |
| الصور | 10 صور | Together.ai مجاني |
| الفيديوهات | 3 فيديوهات | Fal.ai مجاني |

## 🏗️ البنية المعمارية

```
project_uncensored/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # API للدردشة النصية
│   │   ├── generate-image/route.ts # API لتوليد الصور
│   │   └── generate-video/route.ts # API لتوليد الفيديوهات
│   ├── chat/page.tsx              # صفحة الدردشة
│   ├── page.tsx                   # الصفحة الرئيسية
│   └── layout.tsx                 # التخطيط الرئيسي
├── components/
│   ├── chat/ChatInterface.tsx      # واجهة الدردشة
│   ├── ModelSelector.tsx           # منتقي النماذج
│   └── AgeVerificationModal.tsx    # نافذة التحقق من العمر
├── lib/
│   ├── ai.ts                       # دوال الذكاء الاصطناعي
│   ├── db.ts                       # عميل Prisma
│   ├── clerk-prisma.ts             # تكامل Clerk مع Prisma
│   └── utils.ts                    # دوال مساعدة
├── prisma/
│   └── schema.prisma               # نموذج قاعدة البيانات
└── middleware.ts                   # Middleware للمصادقة
```

## 🔐 الأمان والخصوصية

- ✅ جميع الطلبات محمية بمصادقة Clerk
- ✅ التحقق من العمر (18+) إلزامي
- ✅ لا يتم حفظ بيانات حساسة
- ✅ جميع الاتصالات مشفرة (HTTPS)
- ✅ قاعدة البيانات محمية

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT.

## 🤝 المساهمة

نرحب بالمساهمات! يرجى فتح issue أو pull request.

## 📧 التواصل

للأسئلة والاستفسارات، يرجى فتح issue على GitHub.

---

**ملاحظة**: هذا الموقع مخصص للبالغين فقط (+18) ويحتوي على محتوى قد يكون حساساً. استخدمه بمسؤولية.
