"use client";

import { useState } from "react";

const PURPOSE_OPTIONS = [
  {
    value: "Coffee Chat",
    icon: "☕",
    baseClass:
      "border-[#d8c2a8] bg-[#f8efe6] text-[#6b4f3a] hover:bg-[#f3e4d6]",
    selectedClass:
      "border-[#8b5e3c] bg-[#8b5e3c] text-white",
  },
  {
    value: "Casual Chat",
    icon: "💬",
    baseClass:
      "border-[#cfc6e8] bg-[#f3f0fb] text-[#5d4f8c] hover:bg-[#ebe5f8]",
    selectedClass:
      "border-[#6b5aa6] bg-[#6b5aa6] text-white",
  },
  {
    value: "Walk",
    icon: "🚶",
    baseClass:
      "border-[#bfd8c3] bg-[#edf7ef] text-[#466b4d] hover:bg-[#e2f1e5]",
    selectedClass:
      "border-[#4f8a5b] bg-[#4f8a5b] text-white",
  },
  {
    value: "Meal",
    icon: "🍽",
    baseClass:
      "border-[#e3c9b6] bg-[#fbf3ec] text-[#7a5a42] hover:bg-[#f5e7dc]",
    selectedClass:
      "border-[#9a6a44] bg-[#9a6a44] text-white",
  },
  {
    value: "Study",
    icon: "📚",
    baseClass:
      "border-[#bfd3e8] bg-[#eef5fb] text-[#46627c] hover:bg-[#e2eef8]",
    selectedClass:
      "border-[#4c78a8] bg-[#4c78a8] text-white",
  },
  {
    value: "Make Friends",
    icon: "🤝",
    baseClass:
      "border-[#e7c4cf] bg-[#fbf0f4] text-[#8a5165] hover:bg-[#f7e4eb]",
    selectedClass:
      "border-[#b25d7a] bg-[#b25d7a] text-white",
  },
  {
    value: "Networking",
    icon: "💼",
    baseClass:
      "border-[#c9cfda] bg-[#f4f6fa] text-[#4e596d] hover:bg-[#e9edf5]",
    selectedClass:
      "border-[#5a6780] bg-[#5a6780] text-white",
  },
] as const;

const PURPOSE_DESCRIPTIONS: Record<string, string> = {
  "Coffee Chat": "Quick casual conversation over coffee.",
  "Casual Chat": "Relaxed conversation in a comfortable public place.",
  Walk: "Light walk and chat outdoors.",
  Meal: "Enjoy food and conversation together.",
  Study: "Focus together in a quiet place.",
  "Make Friends": "Meet new people and build genuine connections.",
  Networking: "Professional conversation and connection.",
};

export default function WritePage() {
  const [meetingPurpose, setMeetingPurpose] = useState("");

  const selectedPurpose = PURPOSE_OPTIONS.find(
    (item) => item.value === meetingPurpose
  );

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Create Meetup</h1>

        <div className="mt-8">
          <label className="mb-3 block text-sm font-medium text-[#5a5149]">
            Purpose
          </label>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PURPOSE_OPTIONS.map((item) => {
              const isSelected = meetingPurpose === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMeetingPurpose(item.value)}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    isSelected ? item.selectedClass : item.baseClass
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.value}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            <p className="font-medium text-[#2f2a26]">Purpose description</p>
            <p className="mt-1">
              {meetingPurpose
                ? PURPOSE_DESCRIPTIONS[meetingPurpose]
                : "Choose the kind of meetup you want, and a short description will appear here."}
            </p>
          </div>

          {selectedPurpose && (
            <div className="mt-4">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${selectedPurpose.baseClass}`}
              >
                <span className="mr-2">{selectedPurpose.icon}</span>
                {selectedPurpose.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}