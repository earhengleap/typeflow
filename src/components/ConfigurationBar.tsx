"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaClock, FaQuoteLeft, FaMountain, FaWrench } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useMonkeyTypeStore, GameMode, GameConfig } from "@/hooks/use-monkeytype-store";

const SEPARATOR = <div className="w-[2px] h-4 rounded-full bg-mt-text-dim opacity-15 mx-[24px]" />;

export function ConfigurationBar() {
    const [mounted, setMounted] = React.useState(false);
    const {
        mode,
        config,
        punctuation,
        numbers,
        customText,
        customTextByLanguage,
        customTextMode,
        customTextLimitMode,
        customTextLimitValue,
        customTextPipeDelimiter,
        language,
        setMode,
        setConfig,
        setPunctuation,
        setNumbers,
        setCustomText,
        setCustomTextForLanguage,
        setCustomTextSettings,
        setLanguage,
        isActive,
        isFinished,
        resetLiveState
    } = useMonkeyTypeStore();
    const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);
    const [isCustomTextModalOpen, setIsCustomTextModalOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[40px]" />; // Prevent hydration mismatch

    // Hide when active (unless finished)
    if (isActive && !isFinished) return null;

    const handleModeChange = (newMode: GameMode) => {
        let defaultVal: GameConfig = config;
        if (newMode === "time") {
            defaultVal = (config === 15 || config === 30 || config === 60 || config === 120) ? config : 30;
        } else if (newMode === "words") {
            defaultVal = (config === 10 || config === 25 || config === 50 || config === 100) ? config : 25;
        }
        setMode(newMode);
        setConfig(defaultVal);
    };

    const handleConfigChange = (newConfig: GameConfig) => {
        setConfig(newConfig);
    };

    const hasSubOptions = mode === "time" || mode === "words" || mode === "custom";
    const showToggles = mode !== "quote" && mode !== "zen";
    const presetConfigs = [15, 30, 60, 120, 10, 25, 50, 100];
    const sectionTransition = { duration: 0.24, ease: [0.25, 0.1, 0.25, 1] as const };
    const languageCustomText = customTextByLanguage?.[language] ?? (language === "english" ? customText : "");
    const modeOptions: { id: GameMode; label: string; icon: React.ReactNode }[] = [
        { id: "time", label: "time", icon: <FaClock size={16} /> },
        {
            id: "words",
            label: "words",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-[16px] h-[16px] fill-current"
                >
                    <path d="M432 64H16C7.2 64 0 71.2 0 80v64c0 8.8 7.2 16 16 16h144v288c0 26.5 21.5 48 48 48s48-21.5 48-48V160h144c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z" />
                </svg>
            )
        },
        { id: "quote", label: "quote", icon: <FaQuoteLeft size={16} /> },
        { id: "zen", label: "zen", icon: <FaMountain size={16} /> },
        { id: "custom", label: "custom", icon: <FaWrench size={16} /> }
    ];

    return (
        <motion.div
            layout
            transition={{ layout: sectionTransition }}
            className="flex items-center justify-center bg-mt-bg-alt/90 px-8 rounded-xl text-[14px] font-bold lowercase transition-all duration-300 shadow-sm w-fit mx-auto h-[48px]"
        >
            <motion.div layout transition={{ layout: sectionTransition }} className="flex items-center overflow-hidden">
                <AnimatePresence initial={false}>
                    {showToggles && (
                    <motion.div
                        key="toggles"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={sectionTransition}
                        className="flex items-center"
                    >
                        <div className="flex items-center gap-[14px]">
                            <button
                                onClick={() => setPunctuation(!punctuation)}
                                className={cn(
                                    "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                    punctuation ? "text-mt-primary" : "text-mt-text-dim"
                                )}
                            >
                                <span className="text-[15px]">@</span> punctuation
                            </button>
                            <button
                                onClick={() => setNumbers(!numbers)}
                                className={cn(
                                    "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                    numbers ? "text-mt-primary" : "text-mt-text-dim"
                                )}
                            >
                                <span className="text-[15px]">#</span> numbers
                            </button>
                        </div>
                        {SEPARATOR}
                    </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modes */}
            <div className="flex items-center gap-[14px]">
                {modeOptions.map((m) => {
                    const active = mode === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => handleModeChange(m.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors duration-200",
                                active ? "text-mt-primary" : "text-mt-text-dim hover:text-mt-text"
                            )}
                            title={m.id === "zen" ? "Zen mode" : undefined}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {m.icon} {m.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <motion.div layout transition={{ layout: sectionTransition }} className="flex items-center overflow-hidden">
                <AnimatePresence initial={false}>
                    {hasSubOptions ? (
                    <motion.div
                        key={`sub-${mode}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={sectionTransition}
                        className="flex items-center"
                    >
                        {SEPARATOR}

                        <div className="flex items-center gap-[14px]">
                            {mode === "time" && [15, 30, 60, 120].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleConfigChange(t)}
                                    className={cn(
                                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                        config === t ? "text-mt-primary" : "text-mt-text-dim"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        {mode === "words" && [10, 25, 50, 100].map((w) => (
                                <button
                                    key={w}
                                    onClick={() => handleConfigChange(w)}
                                    className={cn(
                                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                        config === w ? "text-mt-primary" : "text-mt-text-dim"
                                    )}
                                >
                                    {w}
                                </button>
                        ))}
                        {(mode === "time" || mode === "words") && (
                            <button
                                onClick={() => setIsCustomModalOpen(true)}
                                className={cn(
                                    "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                    !presetConfigs.includes(Number(config)) ? "text-mt-primary" : "text-mt-text-dim"
                                )}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    className="w-[18px] h-[18px] fill-current -mt-0.5"
                                >
                                    <path d="M102.8 57.3C108.2 51.9 116.6 51.1 123 55.3L241.9 134.5C250.8 140.4 256.1 150.4 256.1 161.1L256.1 210.7L346.9 301.5C380.2 286.5 420.8 292.6 448.1 320L574.2 446.1C592.9 464.8 592.9 495.2 574.2 514L514.1 574.1C495.4 592.8 465 592.8 446.2 574.1L320.1 448C292.7 420.6 286.6 380.1 301.6 346.8L210.8 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.4 122.9C51.2 116.6 52 108.1 57.4 102.7L102.8 57.3zM247.8 360.8C241.5 397.7 250.1 436.7 274 468L179.1 563C151 591.1 105.4 591.1 77.3 563C49.2 534.9 49.2 489.3 77.3 461.2L212.7 325.7L247.9 360.8zM416.1 64C436.2 64 455.5 67.7 473.2 74.5C483.2 78.3 485 91 477.5 98.6L420.8 155.3C417.8 158.3 416.1 162.4 416.1 166.6L416.1 208C416.1 216.8 423.3 224 432.1 224L473.5 224C477.7 224 481.8 222.3 484.8 219.3L541.5 162.6C549.1 155.1 561.8 156.9 565.6 166.9C572.4 184.6 576.1 203.9 576.1 224C576.1 267.2 558.9 306.3 531.1 335.1L482 286C448.9 253 403.5 240.3 360.9 247.6L304.1 190.8L304.1 161.1L303.9 156.1C303.1 143.7 299.5 131.8 293.4 121.2C322.8 86.2 366.8 64 416.1 63.9z" />
                                </svg>
                            </button>
                        )}
                        {mode === "custom" && (
                            <button
                                onClick={() => setIsCustomTextModalOpen(true)}
                                className="py-1 transition-all duration-150 hover:text-mt-text cursor-pointer text-mt-text-dim"
                                type="button"
                            >
                                change
                            </button>
                        )}
                    </div>
                        {SEPARATOR}
                    </motion.div>
                ) : (
                    <motion.div
                        key="sub-empty"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={sectionTransition}
                    >
                        {SEPARATOR}
                    </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Language */}
            <div className="flex items-center gap-[14px]">
                <button
                    onClick={() => setLanguage("english")}
                    className={cn(
                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        language === "english" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    english
                </button>
                <button
                    onClick={() => setLanguage("khmer")}
                    className={cn(
                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        language === "khmer" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    khmer
                </button>
            </div>

            {/* Custom Input Modal */}
            <CustomInputModal 
                isOpen={isCustomModalOpen} 
                onClose={() => setIsCustomModalOpen(false)}
                type={mode === "time" ? "time" : "words"}
                onConfirm={(val) => {
                    setConfig(val);
                    resetLiveState(mode === "time" ? val : 30);
                    setIsCustomModalOpen(false);
                }}
            />

            <CustomTextModal
                isOpen={isCustomTextModalOpen}
                initialValue={languageCustomText}
                initialMode={customTextMode}
                initialLimitMode={customTextLimitMode}
                initialLimitValue={customTextLimitValue}
                initialPipeDelimiter={customTextPipeDelimiter}
                language={language}
                onClose={() => setIsCustomTextModalOpen(false)}
                onConfirm={(payload) => {
                    setCustomTextForLanguage(language, payload.text);
                    if (language === "english") setCustomText(payload.text);
                    setCustomTextSettings({
                        customTextMode: payload.mode,
                        customTextLimitMode: payload.limitMode,
                        customTextLimitValue: payload.limitValue,
                        customTextPipeDelimiter: payload.pipeDelimiter
                    });
                    setMode("custom");
                    setIsCustomTextModalOpen(false);
                }}
            />
        </motion.div>
    );
}

interface CustomInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "time" | "words";
    onConfirm: (val: number) => void;
}

interface CustomTextModalProps {
    isOpen: boolean;
    initialValue: string;
    initialMode: "simple" | "repeat" | "shuffle" | "random";
    initialLimitMode: "none" | "word" | "time" | "section";
    initialLimitValue: number;
    initialPipeDelimiter: boolean;
    language: "english" | "khmer";
    onClose: () => void;
    onConfirm: (payload: {
        text: string;
        mode: "simple" | "repeat" | "shuffle" | "random";
        limitMode: "none" | "word" | "time" | "section";
        limitValue: number;
        pipeDelimiter: boolean;
    }) => void;
}

function CustomInputModal({ isOpen, onClose, type, onConfirm }: CustomInputModalProps) {
    const [inputValue, setInputValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const parseVal = (input: string) => {
        let val = 0;
        if (type === "time") {
            const h = input.match(/(\d+)h/);
            const m = input.match(/(\d+)m/);
            const s = input.match(/(\d+)s/);
            const pureNum = input.match(/^(\d+)$/);

            if (pureNum) {
                val = parseInt(pureNum[1]);
            } else {
                if (h) val += parseInt(h[1]) * 3600;
                if (m) val += parseInt(m[1]) * 60;
                if (s) val += parseInt(s[1]);
            }
        } else {
            val = parseInt(input.replace(/[^0-9]/g, "")) || 0;
        }
        return isNaN(val) ? 0 : val;
    };

    const getDynamicLabel = (val: number) => {
        if (val === 0 || isNaN(val)) return "infinite test";
        if (type === "words") return `${val} words`;
        
        const h = Math.floor(val / 3600);
        const m = Math.floor((val % 3600) / 60);
        const s = val % 60;

        const res = [];
        if (h > 0) res.push(`${h} hour${h > 1 ? 's' : ''}`);
        if (m > 0) res.push(`${m} minute${m > 1 ? 's' : ''}`);
        if (s > 0) res.push(`${s} second${s > 1 ? 's' : ''}`);
        
        if (res.length === 0) return "infinite test";
        if (res.length === 1) return res[0];
        const last = res.pop();
        return `${res.join(", ")} and ${last}`;
    };

    const handleConfirm = () => {
        const val = parseVal(inputValue);
        onConfirm(val);
    };

    const currentVal = parseVal(inputValue);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div 
                className="relative w-full max-w-md bg-mt-bg p-8 rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-bold text-mt-text opacity-50 normal-case">
                        {type === "time" ? "Test duration" : "Custom word amount"}
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="text-mt-primary text-center text-sm font-bold lowercase">
                                {getDynamicLabel(currentVal)}
                            </div>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value.toLowerCase().replace(type === "time" ? /[^0-9hms]/g : /[^0-9]/g, ""))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.stopPropagation();
                                            handleConfirm();
                                            return;
                                        }
                                        if (e.key === "Escape") {
                                            e.stopPropagation();
                                            onClose();
                                            return;
                                        }
                                        
                                        // Stop propagation for normal characters and editing keys
                                        // to prevent the global typing engine from stealing focus.
                                        // Allow global shortcuts (Ctrl/Cmd combinations) to bubble.
                                        const isModifier = e.ctrlKey || e.metaKey || e.altKey;
                                        if (!isModifier) {
                                            e.stopPropagation();
                                        }
                                    }}
                                    className="w-full bg-mt-bg-alt/50 border-none outline-none rounded-lg p-4 text-3xl font-mono text-mt-primary text-center selection:bg-mt-primary/30 caret-mt-primary"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4 text-xs text-mt-text-dim text-center leading-relaxed">
                            {type === "time" && (
                                <div className="opacity-70">
                                    you can use <kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">h</kbd> for hours and <kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">m</kbd> for minutes, for example <span className="text-mt-text">1h30m</span>.
                                </div>
                            )}

                            <div className="opacity-70">
                                you can start an infinite test by inputting 0. then, to stop the test, use the bail out feature (<kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">esc</kbd> or <kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">ctrl</kbd>+<kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">shift</kbd>+<kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">p</kbd> &gt; bail out)
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-mt-bg-alt/50 hover:bg-mt-bg-alt hover:text-mt-text transition-all rounded-lg text-mt-text-dim font-bold lowercase mt-2"
                    >
                        ok
                    </button>
                </div>
            </div>
        </div>
    );
}

function CustomTextModal({
    isOpen,
    initialValue,
    initialMode,
    initialLimitMode,
    initialLimitValue,
    initialPipeDelimiter,
    language,
    onClose,
    onConfirm
}: CustomTextModalProps) {
    const [value, setValue] = React.useState(initialValue);
    const [mode, setMode] = React.useState<"simple" | "repeat" | "shuffle" | "random">(initialMode);
    const [limitMode, setLimitMode] = React.useState<"none" | "word" | "time" | "section">(initialLimitMode);
    const [limitValue, setLimitValue] = React.useState(`${initialLimitValue || ""}`);
    const [pipeDelimiter, setPipeDelimiter] = React.useState(initialPipeDelimiter);
    const [removeZeroWidth, setRemoveZeroWidth] = React.useState(true);
    const [removeFancy, setRemoveFancy] = React.useState(true);
    const [replaceControl, setReplaceControl] = React.useState(true);
    const [replaceNewlines, setReplaceNewlines] = React.useState<"off" | "space" | "periodSpace">("off");
    const [savedTexts, setSavedTexts] = React.useState<{ name: string; text: string }[]>([]);
    const [filterMin, setFilterMin] = React.useState("");
    const [filterMax, setFilterMax] = React.useState("");
    const [filterInclude, setFilterInclude] = React.useState("");
    const [filterExclude, setFilterExclude] = React.useState("");
    const [generatorCharset, setGeneratorCharset] = React.useState("abcdefghijklmnopqrstuvwxyz");
    const [generatorMin, setGeneratorMin] = React.useState("2");
    const [generatorMax, setGeneratorMax] = React.useState("5");
    const [generatorCount, setGeneratorCount] = React.useState("100");

    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);
    const SAVED_KEY = "mt_custom_text_saved_v1";

    const loadSaved = React.useCallback(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
            if (Array.isArray(parsed)) {
                setSavedTexts(parsed.filter((x) => x && typeof x.name === "string" && typeof x.text === "string"));
            }
        } catch {
            setSavedTexts([]);
        }
    }, []);

    React.useEffect(() => {
        if (!isOpen) return;
        setValue(initialValue);
        setMode(initialMode);
        setLimitMode(initialLimitMode);
        setLimitValue(`${initialLimitValue || ""}`);
        setPipeDelimiter(initialPipeDelimiter);
        loadSaved();
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen, initialValue, initialMode, initialLimitMode, initialLimitValue, initialPipeDelimiter, loadSaved]);

    if (!isOpen) return null;

    const cleanTypography = (text: string) => text
        .replace(/[“”„‟]/g, "\"")
        .replace(/[‘’‚‛]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/…/g, "...");

    const processText = (raw: string) => {
        let text = raw.normalize();
        text = text.replace(/[\u2000-\u200A\u202F\u205F\u00A0]/g, " ");
        if (removeZeroWidth) text = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
        if (replaceControl) text = text.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
        text = text.replace(/ +/g, " ");
        if (removeFancy) text = cleanTypography(text);
        if (replaceNewlines === "space") text = text.replace(/\r?\n/g, " ");
        if (replaceNewlines === "periodSpace") text = text.replace(/\r?\n/g, ". ").replace(/\.\. /g, ". ");
        return text;
    };

    const toWords = (raw: string) => {
        const processed = processText(raw);
        if (pipeDelimiter) {
            return processed.split("|").map(w => w.trim()).filter(Boolean);
        }

        const hasWhitespace = /\s/.test(processed);
        if (hasWhitespace) {
            return processed.split(/\s+/).map(w => w.trim()).filter(Boolean);
        }

        if (language === "khmer" && typeof Intl !== "undefined" && "Segmenter" in Intl) {
            try {
                const seg = new Intl.Segmenter("km", { granularity: "word" });
                const pieces = Array.from(seg.segment(processed))
                    .map((s: { segment: string }) => s.segment.trim())
                    .filter(Boolean);
                if (pieces.length > 0) return pieces;
            } catch {
                // Fallback below.
            }
        }

        return processed.trim().length > 0 ? [processed.trim()] : [];
    };

    const handleSave = () => {
        const name = window.prompt("Save custom text as:", "my text");
        if (!name || !name.trim()) return;
        const next = [{ name: name.trim(), text: value }, ...savedTexts.filter(s => s.name !== name.trim())].slice(0, 50);
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setSavedTexts(next);
    };

    const handleLoadSaved = (text: string) => setValue(text);
    const handleDeleteSaved = (name: string) => {
        const next = savedTexts.filter(s => s.name !== name);
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setSavedTexts(next);
    };

    const applyWordFilter = (action: "set" | "add") => {
        const words = toWords(value);
        const min = filterMin ? parseInt(filterMin, 10) : null;
        const max = filterMax ? parseInt(filterMax, 10) : null;
        const include = filterInclude.trim().toLowerCase();
        const exclude = filterExclude.trim().toLowerCase();

        const filtered = words.filter((w) => {
            if (min !== null && w.length < min) return false;
            if (max !== null && w.length > max) return false;
            if (include && !w.toLowerCase().includes(include)) return false;
            if (exclude && w.toLowerCase().includes(exclude)) return false;
            return true;
        });

        if (filtered.length === 0) return;
        const generated = filtered.join(pipeDelimiter ? "|" : " ");
        setValue(action === "set" ? generated : `${value.trim()} ${generated}`.trim());
    };

    const applyGenerator = (action: "set" | "add") => {
        const charsetTokens = generatorCharset.includes(" ")
            ? generatorCharset.split(/\s+/).filter(Boolean)
            : generatorCharset.split("");
        if (charsetTokens.length === 0) return;
        const min = Math.max(1, parseInt(generatorMin || "1", 10));
        const max = Math.max(min, parseInt(generatorMax || generatorMin || "1", 10));
        const count = Math.max(1, parseInt(generatorCount || "1", 10));
        const generated: string[] = [];
        for (let i = 0; i < count; i++) {
            const len = Math.floor(Math.random() * (max - min + 1)) + min;
            let word = "";
            for (let j = 0; j < len; j++) word += charsetTokens[Math.floor(Math.random() * charsetTokens.length)];
            generated.push(word);
        }
        const text = generated.join(pipeDelimiter ? "|" : " ");
        setValue(action === "set" ? text : `${value.trim()} ${text}`.trim());
    };

    const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setValue(String(reader.result || ""));
        reader.readAsText(file, "UTF-8");
        e.target.value = "";
    };

    const handleApply = () => {
        const words = toWords(value);
        if (words.length === 0) return;
        const normalizedMode = mode === "simple" ? "repeat" : mode;
        const normalizedLimitMode = mode === "simple" ? (pipeDelimiter ? "section" : "word") : limitMode;
        const normalizedLimitValue = mode === "simple"
            ? words.length
            : (normalizedLimitMode === "none" ? 0 : Math.max(0, parseInt(limitValue || "0", 10)));

        onConfirm({
            text: words.join(pipeDelimiter ? "|" : " "),
            mode: normalizedMode,
            limitMode: normalizedLimitMode,
            limitValue: normalizedLimitValue,
            pipeDelimiter
        });
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            <div
                className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto custom-scrollbar bg-mt-bg/95 border border-mt-bg-alt/70 p-6 sm:p-8 rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={handleSave} className="cursor-pointer px-3 py-1.5 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 hover:bg-mt-bg-alt/80 text-mt-text-dim hover:text-mt-text text-xs font-bold lowercase transition-all duration-150">save</button>
                        <button onClick={() => loadSaved()} className="cursor-pointer px-3 py-1.5 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 hover:bg-mt-bg-alt/80 text-mt-text-dim hover:text-mt-text text-xs font-bold lowercase transition-all duration-150">saved texts</button>
                        <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileOpen} />
                        <button onClick={() => fileRef.current?.click()} className="cursor-pointer px-3 py-1.5 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 hover:bg-mt-bg-alt/80 text-mt-text-dim hover:text-mt-text text-xs font-bold lowercase transition-all duration-150">open file</button>
                    </div>

                    {savedTexts.length > 0 && (
                        <div className="p-3 rounded-lg bg-mt-bg-alt/30 border border-mt-bg-alt/70 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)]">
                            <div className="text-xs font-bold text-mt-text-dim mb-2 lowercase tracking-wide">saved texts</div>
                            <div className="flex flex-wrap gap-2">
                                {savedTexts.map((s) => (
                                    <div key={s.name} className="flex items-center gap-1">
                                        <button onClick={() => handleLoadSaved(s.text)} className="cursor-pointer px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 hover:bg-mt-bg-alt/80 text-[11px] text-mt-text-dim hover:text-mt-text transition-all duration-150">{s.name}</button>
                                        <button onClick={() => handleDeleteSaved(s.name)} className="cursor-pointer px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/20 hover:bg-red-500/20 text-[11px] text-mt-text-dim transition-all duration-150">x</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                e.stopPropagation();
                                onClose();
                            }
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                                e.preventDefault();
                                handleApply();
                            }
                        }}
                        className="w-full h-56 sm:h-64 bg-mt-bg-alt/35 border border-mt-bg-alt/70 outline-none rounded-lg p-4 text-sm leading-relaxed text-mt-text selection:bg-mt-primary/30 caret-mt-primary resize-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/50"
                        placeholder="custom text"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-mt-bg-alt/30 border border-mt-bg-alt/70 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-2">
                            <div className="text-xs font-bold text-mt-text-dim lowercase tracking-wide">mode</div>
                            <div className="flex flex-wrap gap-2">
                                {(["simple", "repeat", "shuffle", "random"] as const).map((m) => (
                                    <button key={m} onClick={() => setMode(m)} className={cn("cursor-pointer px-3 py-1 rounded-md text-xs font-bold lowercase border transition-all duration-150", mode === m ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>{m}</button>
                                ))}
                            </div>
                            <div className="text-xs font-bold text-mt-text-dim lowercase mt-2 tracking-wide">limit</div>
                            <div className="flex flex-wrap gap-2">
                                {(["none", "word", "time", "section"] as const).map((m) => (
                                    <button key={m} onClick={() => setLimitMode(m)} className={cn("cursor-pointer px-3 py-1 rounded-md text-xs font-bold lowercase border transition-all duration-150", limitMode === m ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>{m}</button>
                                ))}
                                {limitMode !== "none" && (
                                    <input
                                        value={limitValue}
                                        onChange={(e) => setLimitValue(e.target.value.replace(/[^0-9]/g, ""))}
                                        className="w-24 px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-mt-text text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60"
                                        placeholder="value"
                                    />
                                )}
                            </div>
                            <div className="text-xs font-bold text-mt-text-dim lowercase mt-2 tracking-wide">word delimiter</div>
                            <div className="flex gap-2">
                                <button onClick={() => setPipeDelimiter(true)} className={cn("cursor-pointer px-3 py-1 rounded-md text-xs font-bold lowercase border transition-all duration-150", pipeDelimiter ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>pipe</button>
                                <button onClick={() => setPipeDelimiter(false)} className={cn("cursor-pointer px-3 py-1 rounded-md text-xs font-bold lowercase border transition-all duration-150", !pipeDelimiter ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>space</button>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-mt-bg-alt/30 border border-mt-bg-alt/70 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-2">
                            <div className="text-xs font-bold text-mt-text-dim lowercase tracking-wide">cleanup</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <button onClick={() => setRemoveZeroWidth(!removeZeroWidth)} className={cn("cursor-pointer px-2 py-1 rounded-md border transition-all duration-150", removeZeroWidth ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>remove zero-width</button>
                                <button onClick={() => setRemoveFancy(!removeFancy)} className={cn("cursor-pointer px-2 py-1 rounded-md border transition-all duration-150", removeFancy ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>remove fancy typography</button>
                                <button onClick={() => setReplaceControl(!replaceControl)} className={cn("cursor-pointer px-2 py-1 rounded-md border transition-all duration-150", replaceControl ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>replace control chars</button>
                                <div className="flex gap-1">
                                    {(["off", "space", "periodSpace"] as const).map((m) => (
                                        <button key={m} onClick={() => setReplaceNewlines(m)} className={cn("cursor-pointer px-2 py-1 rounded-md text-[11px] border transition-all duration-150", replaceNewlines === m ? "text-mt-primary bg-mt-primary/10 border-mt-primary/40" : "text-mt-text-dim bg-mt-bg-alt/40 border-mt-bg-alt/70 hover:bg-mt-bg-alt/75 hover:text-mt-text")}>{m === "periodSpace" ? "period+space" : m}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-mt-bg-alt/30 border border-mt-bg-alt/70 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-2">
                            <div className="text-xs font-bold text-mt-text-dim lowercase tracking-wide">words filter</div>
                            <div className="grid grid-cols-2 gap-2">
                                <input value={filterMin} onChange={(e) => setFilterMin(e.target.value.replace(/[^0-9]/g, ""))} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="min length" />
                                <input value={filterMax} onChange={(e) => setFilterMax(e.target.value.replace(/[^0-9]/g, ""))} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="max length" />
                                <input value={filterInclude} onChange={(e) => setFilterInclude(e.target.value)} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="include" />
                                <input value={filterExclude} onChange={(e) => setFilterExclude(e.target.value)} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="exclude" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => applyWordFilter("set")} className="cursor-pointer px-3 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs text-mt-text-dim hover:text-mt-text hover:bg-mt-bg-alt/75 lowercase transition-all duration-150">set</button>
                                <button onClick={() => applyWordFilter("add")} className="cursor-pointer px-3 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs text-mt-text-dim hover:text-mt-text hover:bg-mt-bg-alt/75 lowercase transition-all duration-150">add</button>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-mt-bg-alt/30 border border-mt-bg-alt/70 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)] flex flex-col gap-2">
                            <div className="text-xs font-bold text-mt-text-dim lowercase tracking-wide">custom generator</div>
                            <textarea value={generatorCharset} onChange={(e) => setGeneratorCharset(e.target.value)} className="w-full h-20 p-2 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="character set" />
                            <div className="grid grid-cols-3 gap-2">
                                <input value={generatorMin} onChange={(e) => setGeneratorMin(e.target.value.replace(/[^0-9]/g, ""))} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="min" />
                                <input value={generatorMax} onChange={(e) => setGeneratorMax(e.target.value.replace(/[^0-9]/g, ""))} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="max" />
                                <input value={generatorCount} onChange={(e) => setGeneratorCount(e.target.value.replace(/[^0-9]/g, ""))} className="px-2 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs outline-none transition-colors duration-150 focus:border-mt-primary/45 focus:bg-mt-bg-alt/60" placeholder="count" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => applyGenerator("set")} className="cursor-pointer px-3 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs text-mt-text-dim hover:text-mt-text hover:bg-mt-bg-alt/75 lowercase transition-all duration-150">set</button>
                                <button onClick={() => applyGenerator("add")} className="cursor-pointer px-3 py-1 rounded-md border border-mt-bg-alt/70 bg-mt-bg-alt/40 text-xs text-mt-text-dim hover:text-mt-text hover:bg-mt-bg-alt/75 lowercase transition-all duration-150">add</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-mt-text-dim">
                        <span className="opacity-70">Ctrl+Enter to apply</span>
                        <span className="opacity-70">{value.trim().length} chars</span>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="cursor-pointer px-4 py-2 rounded-lg border border-mt-bg-alt/70 bg-mt-bg-alt/40 hover:bg-mt-bg-alt transition-all duration-150 text-mt-text-dim hover:text-mt-text font-bold lowercase"
                        >
                            cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="cursor-pointer px-4 py-2 rounded-lg border border-mt-primary/40 bg-mt-primary/20 hover:bg-mt-primary/30 transition-all duration-150 text-mt-primary font-bold lowercase"
                        >
                            ok
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
