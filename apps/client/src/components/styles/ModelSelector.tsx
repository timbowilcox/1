'use client';

import { Model } from "shared";
import { env } from "@/lib/env";

interface ModelSelectorProps {
    selectedModel: Model;
    onSelectModel: (model: Model) => void;
}

const models: { id: Model; label: string }[] = [
    { id: 'openai', label: 'OpenAI DALL-E 3' },
    { id: 'gemini', label: 'Google Gemini' },
    { id: 'stable-diffusion', label: 'Stable Diffusion XL' },
];

const isSandbox = env.appMode !== "production";

export default function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
    return (
        <div className="w-full max-w-md mx-auto mb-12">
            <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-900">AI Model</label>
                {isSandbox && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-zinc-100 text-zinc-500">
                        Sandbox Mode
                    </span>
                )}
            </div>

            <div className="bg-white border border-zinc-200 p-1 rounded-xl flex gap-1 shadow-sm">
                {models.map((model) => (
                    <button
                        key={model.id}
                        onClick={() => onSelectModel(model.id)}
                        className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedModel === model.id
                            ? 'bg-zinc-900 text-white shadow-md'
                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                            }`}
                    >
                        {model.label.split(' ')[0]}
                        <span className="hidden sm:inline"> {model.label.split(' ').slice(1).join(' ')}</span>
                    </button>
                ))}
            </div>
            {isSandbox && (
                <p className="mt-3 text-xs text-center text-zinc-400">
                    All models are currently running in limited sandbox mode.
                </p>
            )}
        </div>
    );
}
