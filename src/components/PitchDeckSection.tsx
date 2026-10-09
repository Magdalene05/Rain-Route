import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Presentation, Users, GraduationCap } from 'lucide-react';
import { PITCH_DECK_SLIDES, Language } from '../data/rainRouteData';

interface PitchDeckSectionProps {
  lang: Language;
}

export const PitchDeckSection: React.FC<PitchDeckSectionProps> = ({ lang }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slides' | 'grid'>('slides');

  const currentSlide = PITCH_DECK_SLIDES[activeSlideIndex];

  const handlePrev = () => {
    setActiveSlideIndex((prev) => (prev > 0 ? prev - 1 : PITCH_DECK_SLIDES.length - 1));
  };

  const handleNext = () => {
    setActiveSlideIndex((prev) => (prev < PITCH_DECK_SLIDES.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <p className="text-xs font-mono text-cyan-400 tracking-wide">
            TEAM NEXUS · ST. MOTHER THERESA ENGINEERING COLLEGE, THOOTHUKUDI
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-1 font-display">
            {lang === 'ta'
              ? 'RainRoute திட்ட விளக்கக்காட்சி (15 Slides)'
              : 'RainRoute Project Pitch Deck — Team NEXUS'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Department of Computer Science & Engineering · II Year · "United by purpose, driven by innovation"
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setViewMode('slides')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
              viewMode === 'slides'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Slide Deck
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[36px] ${
              viewMode === 'grid'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All 15 Slides Overview
          </button>
        </div>
      </div>

      {/* Team NEXUS Summary Banner */}
      <div className="mb-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100">
              St. Mother Theresa Engineering College, Thoothukudi — CSE Department (II Year)
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-cyan-400 font-medium">N. Magdalene Ashirvatham (Team Leader)</span>
              <span>·</span>
              <span>A. Srini (Developer)</span>
              <span>·</span>
              <span>P. Revathi (Designer)</span>
              <span>·</span>
              <span>B. Benisha (Researcher)</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 shrink-0 tabular-nums">
          Slide {activeSlideIndex + 1} of {PITCH_DECK_SLIDES.length}
        </div>
      </div>

      {viewMode === 'slides' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Slide Index Sidebar */}
          <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-3 max-h-[540px] overflow-y-auto space-y-1">
            {PITCH_DECK_SLIDES.map((s, idx) => {
              const isCurrent = idx === activeSlideIndex;
              return (
                <button
                  key={s.slideNumber}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-3 cursor-pointer min-h-[42px] ${
                    isCurrent
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                  }`}
                >
                  <span className="font-mono text-[11px] text-cyan-400 w-6 shrink-0 tabular-nums">
                    {String(s.slideNumber).padStart(2, '0')}.
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Slide Stage */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 flex flex-col justify-between min-h-[460px]">
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800 pb-4">
                <span className="font-mono text-cyan-400">
                  SLIDE {String(currentSlide.slideNumber).padStart(2, '0')} / 15 · {currentSlide.category}
                </span>
                <span className="font-mono">TEAM NEXUS</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-6 font-display leading-tight">
                {currentSlide.title}
              </h3>
              <p className="text-sm font-medium text-cyan-400 mt-1.5">{currentSlide.subtitle}</p>

              {/* Quantitative Metrics if present (Slide 5) */}
              {currentSlide.highlightMetric && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {currentSlide.highlightMetric.map((m, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                        {m.value}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-1">{m.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{m.context}</div>
                    </div>
                  ))}
                </div>
              )}

              <ul className="mt-6 space-y-3">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm sm:text-base text-slate-200 leading-relaxed"
                  >
                    <span className="font-mono text-xs text-cyan-400 mt-1 shrink-0 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              {currentSlide.quote && (
                <div className="mt-6 p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-sm italic text-cyan-300">
                  {currentSlide.quote}
                </div>
              )}
            </div>

            {/* Slide Controls */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="text-xs text-slate-400 font-mono tabular-nums">
                {currentSlide.slideNumber} / {PITCH_DECK_SLIDES.length}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* All 15 Slides Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PITCH_DECK_SLIDES.map((s, idx) => (
            <div
              key={s.slideNumber}
              onClick={() => {
                setActiveSlideIndex(idx);
                setViewMode('slides');
              }}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-cyan-400 font-semibold">
                    SLIDE {String(s.slideNumber).padStart(2, '0')}
                  </span>
                  <span>{s.category.split('|')[0]}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mt-2 font-display">
                  {s.title}
                </h3>
                <p className="text-xs text-cyan-400/90 mt-1">{s.subtitle}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-300">
                  {s.bullets.slice(0, 4).map((b, i) => (
                    <li key={i} className="leading-relaxed">
                      • {b}
                    </li>
                  ))}
                </ul>
              </div>
              {s.quote && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] italic text-slate-400">
                  {s.quote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
