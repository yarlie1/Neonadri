import {
  Activity,
  BookOpen,
  Cake,
  Camera,
  Coffee,
  Film,
  Footprints,
  Gamepad2,
  Laptop,
  Mic,
  Smile,
  Target,
  Utensils,
  type LucideIcon,
  Dice5,
} from "lucide-react";

export const PURPOSE_OPTIONS: ReadonlyArray<{
  value: string;
  icon: LucideIcon;
}> = [
  { value: "Coffee Chat", icon: Coffee },
  { value: "Lunch", icon: Utensils },
  { value: "Dinner", icon: Utensils },
  { value: "Dessert", icon: Cake },
  { value: "Walk", icon: Footprints },
  { value: "Jogging", icon: Activity },
  { value: "Yoga", icon: Smile },
  { value: "Movie", icon: Film },
  { value: "Karaoke", icon: Mic },
  { value: "Board Games", icon: Dice5 },
  { value: "Gaming", icon: Gamepad2 },
  { value: "Arcade", icon: Target },
  { value: "Study", icon: BookOpen },
  { value: "Work Together", icon: Laptop },
  { value: "Photo Walk", icon: Camera },
] as const;

export const PURPOSE_HELP_TEXT: Record<string, string> = {
  "Coffee Chat": "Quick casual conversation over coffee.",
  Meal: "Enjoy food and conversation together.",
  Lunch: "Keep it casual with a daytime meal.",
  Dinner: "Plan a slower evening meal and conversation.",
  Dessert: "Meet for dessert, cafe time, and easy conversation.",
  Walk: "Light walk and chat outdoors.",
  Jogging: "Go for a jog together and stay active.",
  Yoga: "Join a calm and healthy yoga session together.",
  Movie: "Watch a movie together and chat after.",
  Karaoke: "Sing and have fun together.",
  "Board Games": "Play board games and enjoy a relaxed meetup.",
  Gaming: "Play video games together.",
  Arcade: "Have fun with arcade games together.",
  Study: "Focus together in a quiet place.",
  "Work Together": "Work side by side in a cafe or shared space.",
  "Photo Walk": "Walk around and take photos together.",
};

export function formatDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getDatePart(dateTimeValue: string) {
  return dateTimeValue ? dateTimeValue.slice(0, 10) : "";
}

export function getTimePart(dateTimeValue: string) {
  return dateTimeValue ? dateTimeValue.slice(11, 16) : "";
}

export function combineDateAndTime(datePart: string, timePart: string) {
  if (!datePart || !timePart) return "";
  return `${datePart}T${timePart}`;
}

export function getDefaultMeetingTime() {
  const now = new Date();
  const target = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  target.setMinutes(0, 0, 0);

  if (target.getTime() < now.getTime() + 3 * 60 * 60 * 1000) {
    target.setHours(target.getHours() + 1);
  }

  return formatDateTimeLocalValue(target);
}
