"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const COMMON_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python",
  "PostgreSQL", "MongoDB", "GraphQL", "REST API", "Docker", "AWS",
  "Tailwind CSS", "CSS", "HTML", "Vue.js", "Angular", "Go",
  "Java", "C++", "Ruby", "PHP", "Laravel", "Django",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "SEO", "Content Writing", "Copywriting", "Data Analysis", "Machine Learning",
];

interface SkillSelectorProps {
  value: string[];
  onChange: (skills: string[]) => void;
  error?: string;
  label?: string;
  maxSkills?: number;
}

export function SkillSelector({
  value,
  onChange,
  error,
  label = "Skills",
  maxSkills = 15,
}: SkillSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = COMMON_SKILLS.filter(
    (skill) =>
      skill.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(skill)
  ).slice(0, 8);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function addSkill(skill: string) {
    const trimmed = skill.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= maxSkills) return;
    onChange([...value, trimmed]);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    onChange(value.filter((s) => s !== skill));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeSkill(value[value.length - 1]);
    }
  }

  return (
    <div className="relative flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          <span className="ml-1 text-gray-400 font-normal text-xs">
            (max {maxSkills})
          </span>
        </label>
      )}
      <div
        className={cn(
          "min-h-[42px] w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 flex flex-wrap gap-1.5",
          "transition-colors focus-within:border-accent-600 focus-within:ring-2 focus-within:ring-accent-600/20",
          error && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
          "cursor-text"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800"
          >
            {skill}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeSkill(skill);
              }}
              className="ml-0.5 rounded-full hover:bg-brand-200 p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600"
              aria-label={`Remove ${skill}`}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        {value.length < maxSkills && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => setIsOpen(inputValue.length > 0)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? "Type or select skills..." : "Add more..."}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
          />
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg" role="listbox" aria-label="Skill suggestions" style={{ top: "100%" }}>
          {filteredSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-800 first:rounded-t-lg last:rounded-b-lg"
            >
              <Plus className="h-3.5 w-3.5" />
              {skill}
            </button>
          ))}
          {inputValue && !COMMON_SKILLS.includes(inputValue) && (
            <button
              type="button"
              onClick={() => addSkill(inputValue)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-brand-800 hover:bg-brand-50 border-t border-gray-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add &quot;{inputValue}&quot;
            </button>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">Press Enter or comma to add. Click X to remove.</p>
    </div>
  );
}
