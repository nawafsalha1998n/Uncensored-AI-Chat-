"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AgeVerificationModal() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const isAdult = user.unsafeMetadata?.isAdult === true;
      if (!isAdult) {
        setShowModal(true);
      }
    }
  }, [isLoaded, user]);

  const handleConfirm = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await user.update({
        unsafeMetadata: {
          isAdult: true,
          verifiedAt: new Date().toISOString(),
        },
      });
      setShowModal(false);
    } catch (error) {
      console.error("خطأ في التحديث:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = () => {
    router.push("/");
  };

  if (!showModal || !isLoaded) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3">تحذير مهم</h2>

        {/* Content */}
        <div className="space-y-4 mb-8">
          <p className="text-center text-zinc-300">
            هذا الموقع يحتوي على محتوى حساس وغير مقيد مخصص للبالغين فقط.
          </p>
          <div className="bg-red-900/20 border border-red-800 rounded-2xl p-4">
            <p className="text-sm text-red-300">
              <strong>⚠️ تأكيد:</strong> أنا أؤكد أنني بالغ (18 سنة فما فوق) وأفهم طبيعة المحتوى على هذا الموقع.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-medium transition disabled:opacity-50"
          >
            رفض
          </button>
          <button
            onClick={handleConfirm}
            disabled={isUpdating}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-2xl font-medium text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                أوافق
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          بالموافقة، أنت توافق على شروط الاستخدام والسياسات الخاصة بنا
        </p>
      </div>
    </div>
  );
}
