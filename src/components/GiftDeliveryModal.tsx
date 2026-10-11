import React, { useState } from 'react';
import { Student, RewardTier, ClaimedReward } from '../types';
import { Gift, Sparkles, Check, X, Calendar, User, FileText } from 'lucide-react';
import { triggerGiftCelebration } from '../utils/confetti';

interface GiftDeliveryModalProps {
  student: Student;
  tier: RewardTier;
  onClose: () => void;
  onConfirmDelivery: (studentId: string, claimData: ClaimedReward) => void;
}

export const GiftDeliveryModal: React.FC<GiftDeliveryModalProps> = ({
  student,
  tier,
  onClose,
  onConfirmDelivery,
}) => {
  const [giftName, setGiftName] = useState(tier.defaultGiftName);
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [servantNote, setServantNote] = useState('تم التسليم أثناء الاجتماع');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const claim: ClaimedReward = {
      id: `claim-${Date.now()}`,
      tierId: tier.id,
      tierTitle: tier.title,
      giftName: giftName.trim() || tier.defaultGiftName,
      date: deliveryDate,
      servantNote: servantNote.trim(),
      milestoneStreak: tier.requiredStreak,
    };

    triggerGiftCelebration();
    onConfirmDelivery(student.id, claim);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center shadow-md">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">تسليم مكافأة الالتزام</h3>
            <p className="text-xs text-slate-500">
              تسجيل تسليم الهدية رسمياً في سجلات الخدمة وإضافة نقاط البونص.
            </p>
          </div>
        </div>

        {/* Student & Milestone summary */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>المخدوم:</span>
            </span>
            <span className="text-slate-900 text-sm font-black">{student.name}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600">المرحلة والأسرة:</span>
            <span className="text-slate-700">{student.grade} • {student.family}</span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-amber-200/60">
            <span className="text-slate-600">المستوى المحقق:</span>
            <span className="text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md font-black">
              {tier.title} (تتابع {tier.requiredStreak} مرات)
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم الهدية الفعلية المسلمة
            </label>
            <input
              type="text"
              required
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="مثال: نوت بوك روحي مميز + ميدالية"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                تاريخ التسليم
              </label>
              <input
                type="date"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                بونص إضافي
              </label>
              <div className="px-3 py-2 text-xs sm:text-sm font-black text-amber-900 bg-amber-50 border border-amber-200 rounded-xl">
                +{tier.bonusPointsReward} نقطة
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظة الخادم (اختياري)
            </label>
            <input
              type="text"
              value={servantNote}
              onChange={(e) => setServantNote(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="مثال: تم التسليم بواسطة أستاذ بيشوي مع صورة تذكارية"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>تأكيد وتسليم الهدية 🎁</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
