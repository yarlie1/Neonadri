"use client";

import { useState } from "react";

const PURPOSE_OPTIONS = [
  { value: "Coffee Chat", icon: "☕" },
  { value: "Casual Chat", icon: "💬" },
  { value: "Walk", icon: "🚶" },
  { value: "Meal", icon: "🍽" },
  { value: "Study", icon: "📚" },
  { value: "Make Friends", icon: "🤝" },
];

const PURPOSE_DESCRIPTIONS: Record<string, string> = {
  "Coffee Chat": "Quick casual conversation over coffee",
  "Casual Chat": "Relaxed conversation with no pressure",
  Walk: "Light walk and chat outdoors",
  Meal: "Enjoy food and conversation together",
  Study: "Focus together in a quiet place",
  "Make Friends": "Meet new people and build connections",
};

export default function WritePage() {
  const [purpose, setPurpose] = useState<string>("");

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-xl font-semibold text-[#2f2a26]">
          Create Meetup
        </h1>

        {/* ✅ Purpose 선택 */}
        <div>
          <label className="text-sm font-medium text-[#6f655c]">
            Purpose
          </label>

          <div className="mt-2 grid grid-cols-2 gap-3">
            {PURPOSE_OPTIONS.map((item) => {
              const isSelected = purpose === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPurpose(item.value)}
                  className={`
                    flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition
                    ${
                      isSelected
                        ? "bg-[#6b5f52] text-white border-[#6b5f52]"
                        : "bg-white border-[#e7ddd2] text-[#2f2a26] hover:bg-[#f4ece4]"
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  {item.value}
                </button>
              );
            })}
          </div>

          {/* ✅ 설명 자동 표시 */}
          {purpose && (
            <div className="mt-3 rounded-xl bg-[#f4ece4] px-4 py-3 text-sm text-[#5a5149]">
              {PURPOSE_DESCRIPTIONS[purpose]}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}