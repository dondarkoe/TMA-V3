
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Mic, Save, BrainCircuit, Zap, FileText, Copy, Type, Video, RefreshCw, Edit3, Sparkles, Edit, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { UserBrainDumpEntry } from '@/api/entities';
import { ContentIdea } from '@/api/entities';

// Import backend functions
import { generateInstantHooks } from '@/api/functions';
import { regenerateIndividualHook } from '@/api/functions';
import { generateContentScript } from '@/api/functions';
import { regenerateScriptSection } from '@/api/functions';
import { claudeBrainDumpAnalyzer } from '@/api/functions'; // New import for Claude analysis

// Storage keys for session persistence
const STORAGE_KEYS = {
    view: 'ark_studio_view',
    mode: 'ark_studio_mode',
    entry: 'ark_studio_entry',
    hooksResult: 'ark_studio_hooks',
    scriptResult: 'ark_studio_script',
    originalIdea: 'ark_studio_original_idea'
};

// Utility functions for session storage
const saveToStorage = (key, value) => {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('Failed to save to sessionStorage:', error);
    }
};

const loadFromStorage = (key) => {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.warn('Failed to load from sessionStorage:', error);
        return null;
    };
};

// Updated HooksResult component with simpler design
function HooksResult({ hooks, originalIdea, onRegenerateHook, onTryNewInput }) {
    const [regeneratingHook, setRegeneratingHook] = useState(null);
    const [newInput, setNewInput] = useState(originalIdea);

    const copyToClipboard = (text) => navigator.clipboard.writeText(text);

    const handleRegenerateHookClick = async (hookNumber) => {
        setRegeneratingHook(hookNumber);
        try {
            await onRegenerateHook(hookNumber, originalIdea);
        } finally {
            setRegeneratingHook(null);
        }
    };

    const hookLabels = {
        hook1: 'Curiosity Gap',
        hook2: 'Authority/Experience',
        hook3: 'Vulnerability/Struggle',
        hook4: 'Secret/Exclusive',
        hook5: 'Social Proof/Challenge'
    };

    if (!hooks) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6"
        >
            <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-xl">
                        <Zap className="w-5 h-5 text-orange-400" />
                        5 Viral Hook Options
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {Object.entries(hooks).map(([hookKey, hookText], index) => (
                        <div key={hookKey} className="p-4 bg-black/30 rounded-lg border border-orange-500/20">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="text-orange-300 text-xs font-semibold uppercase tracking-wider mb-2">
                                        Hook {index + 1}: {hookLabels[hookKey]}
                                    </div>
                                    <p className="text-white text-lg leading-relaxed">{hookText}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRegenerateHookClick(index + 1)}
                                        disabled={regeneratingHook === (index + 1)}
                                        className="text-orange-300 hover:bg-orange-500/10 h-8 px-2"
                                    >
                                        {regeneratingHook === (index + 1) ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-3 h-3" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(hookText)}
                                        className="text-orange-300 hover:bg-orange-500/10 h-8 px-2"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>

                <CardContent className="pt-0">
                    <div className="border-t border-orange-500/20 pt-4">
                        <div className="space-y-3">
                            <label className="text-orange-300 text-sm font-medium">Try different input:</label>
                            <div className="flex gap-2">
                                <Input
                                    value={newInput}
                                    onChange={(e) => setNewInput(e.target.value)}
                                    placeholder="Refine your idea..."
                                    className="flex-1 bg-black/30 border-orange-500/30 text-white placeholder-gray-400"
                                />
                                <Button
                                    onClick={() => onTryNewInput(newInput)}
                                    disabled={!newInput.trim() || newInput === originalIdea}
                                    className="bg-orange-600 hover:bg-orange-700"
                                >
                                    Generate New
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function EditableScriptSection({ title, content, section, onRegenerate, isRegenerating }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [selectedStyle, setSelectedStyle] = useState('current');

    useEffect(() => {
        setEditedContent(content);
    }, [content]);

    const handleSave = () => {
        setIsEditing(false);
    };

    const handleRegenerate = async () => {
        if (onRegenerate) {
            await onRegenerate(section, selectedStyle);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold uppercase text-orange-300 tracking-wider">{title}</h4>
                <div className="flex items-center gap-2">
                    <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={isRegenerating}>
                        <SelectTrigger className="w-24 h-8 text-xs bg-black/30 border-orange-500/30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="current">Same Style</SelectItem>
                            <SelectItem value="longer">Longer</SelectItem>
                            <SelectItem value="punchier">Punchier</SelectItem>
                            <SelectItem value="extreme">More Extreme</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="h-8 px-2 text-orange-300 hover:bg-orange-500/10"
                    >
                        {isRegenerating ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <RefreshCw className="w-3 h-3" />
                        )}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(!isEditing)}
                        className="h-8 px-2 text-orange-300 hover:bg-orange-500/10"
                    >
                        <Edit3 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="bg-black/30 border-orange-500/30 text-white text-sm"
                        rows={3}
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
                            Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-white leading-relaxed bg-black/30 p-3 rounded-md cursor-pointer hover:bg-black/40 transition-colors" onClick={() => setIsEditing(true)}>
                    {editedContent}
                </p>
            )}
        </div>
    );
}

function ScriptResult({ script, originalIdea, onScriptUpdate, onScriptSaved }) {
    const [regeneratingSection, setRegeneratingSection] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    if (!script) return null;

    const scriptSections = [
        { title: 'Hook', key: 'hook', content: script.hook },
        { title: 'Situation', key: 'situation', content: script.situation },
        { title: 'Desire', key: 'desire', content: script.desire },
        { title: 'Conflict', key: 'conflict', content: script.conflict },
        { title: 'Change', key: 'change', content: script.change },
        { title: 'Result', key: 'result', content: script.result },
    ];

    const handleRegenerate = async (section, style) => {
        setRegeneratingSection(section);
        try {
            const { data } = await regenerateScriptSection({
                currentScript: script,
                section: section,
                style: style,
                originalIdea: originalIdea
            });

            if (data && data.success) {
                const updatedScript = { ...script, [section]: data.content };
                onScriptUpdate(updatedScript);
            }
        } catch (error) {
            console.error('Failed to regenerate section:', error);
        } finally {
            setRegeneratingSection(null);
        }
    };

    const handleSaveIdea = async () => {
        if (!script || !originalIdea) return;
        setIsSaving(true);
        setSaveStatus('');
        try {
            const full_script = scriptSections.map(s => `[${s.title}]\n${s.content}`).join('\n\n');
            await ContentIdea.create({
                title: originalIdea,
                original_brain_dump: originalIdea,
                hook: script.hook,
                situation: script.situation,
                desire: script.desire,
                conflict: script.conflict,
                change: script.change,
                result: script.result,
                full_script: full_script,
                status: 'draft',
            });
            setSaveStatus('success');

            setTimeout(() => {
                if (onScriptSaved) {
                    onScriptSaved();
                }
            }, 1500);

        } catch (error) {
            console.error("Failed to save content idea:", error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            if (saveStatus !== 'success') {
                setTimeout(() => setSaveStatus(''), 4000);
            }
        }
    };

    return (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 pt-6"
        >
            <Card className="backdrop-blur-xl bg-black/40 border border-orange-500/20 shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-orange-400" />
                        Your 5-Line Content Script
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {scriptSections.map(section => (
                        section.content && (
                             <EditableScriptSection
                                key={section.key}
                                title={section.title}
                                content={section.content}
                                section={section.key}
                                onRegenerate={handleRegenerate}
                                isRegenerating={regeneratingSection === section.key}
                            />
                        )
                    ))}
                </CardContent>
                <CardFooter className="p-4 bg-black/20 border-t border-orange-500/20 flex justify-end items-center gap-4">
                    {saveStatus === 'success' && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" /><span>Saved!</span></motion.div>}
                    {saveStatus === 'error' && <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-red-400"><AlertCircle className="w-4 h-4" /><span>Failed to save</span></motion.div>}
                    <Button onClick={handleSaveIdea} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
                        <span className="ml-2">Save to Content Ideas</span>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

function WelcomeScreen({ onModeSelect }) {
    const welcomeOptions = [
        {
            title: "Personal Content Idea",
            description: "Tell me about your day, I'll find a story.",
            icon: Sparkles,
            mode: 'create_script'
        },
        {
            title: "Script Mode",
            description: "Give me a topic, I'll write a script.",
            icon: Edit,
            mode: 'create_script'
        },
        {
            title: "Ideate Hooks",
            description: "Get viral hooks for your content idea.",
            icon: Zap,
            mode: 'instant_hooks'
        },
        {
            title: "Brain Dump",
            description: "Log your raw thoughts and ideas.",
            icon: BookOpen,
            mode: 'brain_dump'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
        >
            <motion.div className="pt-5 pb-1 flex justify-center mb-4">
                <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/97f2de4e5_arklogo.png"
                    alt="ARK Logo"
                    className="h-40"
                    style={{ filter: `drop-shadow(0 0 25px rgba(249, 115, 22, 0.6))` }} />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to ARK</h1>
            <p className="text-gray-300 text-lg mb-8">How can I help you create today?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {welcomeOptions.map((opt, index) => (
                    <motion.div
                        key={opt.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="cursor-pointer"
                        onClick={() => onModeSelect(opt.mode)}
                    >
                        <Card className="h-full bg-black/40 border border-orange-500/20 hover:border-orange-400 hover:bg-orange-900/20 transition-all text-left">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <opt.icon className="w-5 h-5 text-orange-300" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white text-md mb-1">{opt.title}</h3>
                                        <p className="text-gray-400 text-sm">{opt.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}


export default function BrainDumpInterface() {
    const [view, setView] = useState('welcome');
    const [entry, setEntry] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('brain_dump');

    const [hooksResult, setHooksResult] = useState(null);
    const [scriptResult, setScriptResult] = useState(null);
    const [originalIdea, setOriginalIdea] = useState('');
    const [saveConfirmation, setSaveConfirmation] = useState(false);

    useEffect(() => {
        const savedView = loadFromStorage(STORAGE_KEYS.view);
        const savedMode = loadFromStorage(STORAGE_KEYS.mode);
        const savedEntry = loadFromStorage(STORAGE_KEYS.entry);
        const savedHooks = loadFromStorage(STORAGE_KEYS.hooksResult);
        const savedScript = loadFromStorage(STORAGE_KEYS.scriptResult);
        const savedOriginalIdea = loadFromStorage(STORAGE_KEYS.originalIdea);

        if (savedView) setView(savedView);
        if (savedMode) setMode(savedMode);
        if (savedEntry) setEntry(savedEntry);
        if (savedHooks) setHooksResult(savedHooks);
        if (savedScript) setScriptResult(savedScript);
        if (savedOriginalIdea) setOriginalIdea(savedOriginalIdea);
    }, []);

    useEffect(() => { saveToStorage(STORAGE_KEYS.view, view); }, [view]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.mode, mode); }, [mode]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.entry, entry); }, [entry]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.hooksResult, hooksResult); }, [hooksResult]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.scriptResult, scriptResult); }, [scriptResult]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.originalIdea, originalIdea); }, [originalIdea]);

    const MODES = {
        brain_dump: {
            placeholder: "What happened today? Any insights? Random thoughts?...",
            buttonIcon: <Save className="w-4 h-4 mr-2" />,
            buttonText: 'Save Entry'
        },
        instant_hooks: {
            placeholder: "Describe your content, track, or idea to get viral hooks...",
            buttonIcon: <Zap className="w-4 h-4 mr-2" />,
            buttonText: 'Generate Hooks'
        },
        create_script: {
            placeholder: "Give me a topic or idea, and I'll write a script...",
            buttonIcon: <FileText className="w-4 h-4 mr-2" />,
            buttonText: 'Create Script'
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setError(null);
        setHooksResult(null);
        setScriptResult(null);
        setSaveConfirmation(false);
    };

    const handleScriptUpdate = (updatedScript) => {
        setScriptResult(updatedScript);
    };

    const handleScriptSaved = () => {
        setView('welcome');
        setEntry('');
        setMode('create_script');
        setHooksResult(null);
        setScriptResult(null);
        setOriginalIdea('');
        setError(null);
        setSaveConfirmation(false);

        Object.values(STORAGE_KEYS).forEach(key => {
            sessionStorage.removeItem(key);
        });
    };

    const handleRegenerateHook = async (hookNumber, originalInput) => {
        try {
            const response = await regenerateIndividualHook({
                originalRequest: originalInput,
                hookNumber: hookNumber
            });

            if (response.data && response.data.success) {
                const hookKey = `hook${hookNumber}`;
                setHooksResult(prev => ({
                    ...prev,
                    [hookKey]: response.data.hook
                }));
            } else {
                throw new Error(response.data?.error || 'Failed to regenerate hook');
            }
        } catch (err) {
            console.error('Hook regeneration error:', err);
            setError(err.message || 'Failed to regenerate hook');
        }
    };

    const handleTryNewInput = (newInput) => {
        if (newInput.trim() && newInput !== originalIdea) {
            setEntry(newInput);
            setOriginalIdea(newInput);
            setHooksResult(null);
            setError(null);
            // Auto-trigger generation
            setTimeout(() => {
                handleSubmit();
            }, 100);
        }
    };

    const handleSubmit = async () => {
        if (!entry.trim()) return;

        setIsGenerating(true);
        setError(null);
        setHooksResult(null);
        setScriptResult(null);
        setSaveConfirmation(false);

        try {
            if (mode === 'brain_dump') {
                const content = entry.trim();
                
                // Create brain dump entry
                const brainDumpEntry = await UserBrainDumpEntry.create({
                    content: content,
                    entry_type: 'text',
                    processing_status: 'pending'
                });

                console.log('Brain dump entry created:', brainDumpEntry.id);

                // Trigger real-time Claude analysis
                try {
                    const { data: analysisResult } = await claudeBrainDumpAnalyzer({
                        latestBrainDumpId: brainDumpEntry.id
                    });
                    
                    if (analysisResult.success) {
                        console.log('Claude analysis completed:', analysisResult.analysis.recommendation);
                        
                        // Update brain dump status
                        // Assuming UserBrainDumpEntry.update is an available method
                        await UserBrainDumpEntry.update(brainDumpEntry.id, {
                            processing_status: 'processed',
                            extracted_themes: analysisResult.analysis.dominant_themes,
                            emotional_tone: analysisResult.analysis.emotional_state?.primary_emotion
                        });
                    } else {
                         console.warn('Claude analysis failed or returned no success:', analysisResult.error);
                    }
                } catch (analysisError) {
                    console.error('Claude analysis failed:', analysisError);
                    // Don't fail the brain dump submission if analysis fails
                }

                // Reset form and show success message
                setEntry('');
                setSaveConfirmation(true);
                
                // Auto-hide success message
                setTimeout(() => {
                    setSaveConfirmation(false);
                }, 3000);

            } else if (mode === 'instant_hooks') {
                console.log('Generating hooks for:', entry); // Debug log
                setOriginalIdea(entry);
                const response = await generateInstantHooks({ request: entry });
                console.log('Hooks response:', response); // Debug log

                if (response.data && response.data.success) {
                    setHooksResult(response.data.hooks);
                } else {
                    throw new Error(response.data?.error || 'Failed to generate hooks');
                }
            } else if (mode === 'create_script') {
                setOriginalIdea(entry);
                const response = await generateContentScript({ request: entry });
                if (response.data && response.data.success) {
                    setScriptResult(response.data.script);
                } else {
                    throw new Error(response.data?.error || 'Failed to generate script');
                }
            }
        } catch (err) {
            console.error('Submit error:', err); // Debug log
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleModeSelect = (selectedMode) => {
        setMode(selectedMode);
        setView('studio');
    };

    if (view === 'welcome') {
        return (
            <div className="w-full h-full flex flex-col justify-center px-4 py-8">
                <WelcomeScreen onModeSelect={handleModeSelect} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col justify-center gap-8 px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-5 pb-1 flex justify-center">
                <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6898328d73648b22a9c1d196/97f2de4e5_arklogo.png"
                    alt="ARK Logo"
                    className="h-32 sm:h-40"
                    style={{ filter: `drop-shadow(0 0 25px rgba(249, 115, 22, 0.6))` }} />
            </motion.div>

            <motion.div
                key={mode}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                <Card className="relative backdrop-blur-xl bg-black/60 border border-orange-500/50">
                    <CardContent className="p-6 sm:p-8 space-y-6">
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={mode + "-title"}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="text-center"
                            >
                                <h2 className="text-xl font-bold text-white">ARK Creative Studio</h2>
                            </motion.div>
                        </AnimatePresence>
                        <Textarea
                            value={entry}
                            onChange={(e) => setEntry(e.target.value)}
                            placeholder={MODES[mode].placeholder}
                            className="min-h-[120px] backdrop-blur-xl bg-black/60 border-orange-500/40 text-white placeholder-gray-400 focus:border-orange-400 text-base leading-relaxed p-4"
                            disabled={isGenerating}
                        />
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <Select onValueChange={handleModeChange} defaultValue={mode}>
                                <SelectTrigger className="w-full sm:w-[220px] backdrop-blur-xl bg-black/60 border-orange-500/40 text-white h-12">
                                    <SelectValue placeholder="Select a mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="brain_dump"><div className="flex items-center gap-2 py-1"><BrainCircuit className="w-4 h-4"/>Brain Dump</div></SelectItem>
                                    <SelectItem value="instant_hooks"><div className="flex items-center gap-2 py-1"><Zap className="w-4 h-4"/>Instant Hooks</div></SelectItem>
                                    <SelectItem value="create_script"><div className="flex items-center gap-2 py-1"><FileText className="w-4 h-4"/>Create Script</div></SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSubmit} disabled={isGenerating || !entry.trim()} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-full sm:w-auto px-6 py-3 text-base font-semibold h-12">
                                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : MODES[mode].buttonIcon}
                                {isGenerating ? 'Generating...' : MODES[mode].buttonText}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="pb-8 space-y-6">
                <AnimatePresence>
                    {isGenerating && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center gap-2 text-orange-300 py-4">
                             <Loader2 className="w-5 h-5 animate-spin" />
                             <span>Generating creative gold...</span>
                        </motion.div>
                    )}
                    {error && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                           <p><strong>Error:</strong> {error}</p>
                         </motion.div>
                    )}
                     {saveConfirmation && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-center">
                           <span>✅ Brain dump saved successfully!</span>
                         </motion.div>
                    )}
                </AnimatePresence>

                {hooksResult && (
                    <HooksResult
                        hooks={hooksResult}
                        originalIdea={originalIdea}
                        onRegenerateHook={handleRegenerateHook}
                        onTryNewInput={handleTryNewInput}
                    />
                )}

                {scriptResult && (
                    <ScriptResult
                        script={scriptResult}
                        originalIdea={originalIdea}
                        onScriptUpdate={handleScriptUpdate}
                        onScriptSaved={handleScriptSaved}
                    />
                )}
            </div>
        </div>
    );
}
