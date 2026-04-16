"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function AgeVerificationModal() {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const isAdult = user.unsafeMetadata?.isAdult === true;
      if (!isAdult) setShowModal(true);
    }
  }, [isLoaded, user]);

  const confirmAdult = async () => {
    if (!user) return;
    await user.update({
      unsafeMetadata: { isAdult: true, verifiedAt: new Date().toISOString() },
    });
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="glass max-w-md w-full mx-4 rounded-3xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">تحقق العمر</h2>
        <p className="text-zinc-300 mb-8">
          هذا الموقع يحتوي على محتوى غير خاضع للرقابة (NSFW).<br />
          يجب أن تكون عمرك 18 سنة أو أكثر.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 py-4 bg-zinc-800 rounded-2xl text-white font-medium"
          >
            أنا أقل من 18
          </button>
          <button
            onClick={confirmAdult}
            className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl font-medium transition"
          >
            أؤكد أنني فوق 18
          </button>
        </div>
      </div>
    </div>
  );
}
