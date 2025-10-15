
import React, { useState, useEffect } from 'react';
import { getGlobalAISettings } from "@/api/functions";
import { updateGlobalAISettings } from "@/api/functions";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertTriangle, Award } from 'lucide-react'; // Added Award
import EngineLayout from '../components/layout/EngineLayout';

export default function GlobalAISettings() {
    const [config, setConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [forbidden, setForbidden] = useState(false);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setIsLoading(true);
        setError(null);
        setForbidden(false); // Reset forbidden status
        try {
            const { data } = await getGlobalAISettings();
            if (data?.success) {
                setConfig(data.config);
            } else {
                if (data?.error === 'Forbidden') {
                    setForbidden(true);
                }
                setError(data?.error || 'Failed to load global AI configuration.');
            }
        } catch (err) {
            // Likely 403/401 or network error. Check for specific status if err.response exists.
            if (err.response && err.response.status === 403) {
                setForbidden(true);
            } else {
                setError('Failed to load global AI configuration.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        setError(null);
        setSaveSuccess(false);
        try {
            const payload = {
                universal_prompt: config.universal_prompt,
                mikki_system_prompt: config.mikki_system_prompt,
                mikki_video_analysis_prompt: config.mikki_video_analysis_prompt,
                default_temperature: config.default_temperature,
                default_top_p: config.default_top_p,
                is_active: config.is_active
            };
            const { data } = await updateGlobalAISettings(payload);
            if (data?.success) {
                setConfig(data.config); // Update local state with the returned (potentially updated) config
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setError(data?.error || 'Failed to save configuration.');
            }
        } catch (err) {
            setError('Failed to save configuration.');
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <EngineLayout engineType="TMA" currentPageName="GlobalAISettings">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
            </EngineLayout>
        );
    }

    if (forbidden) {
        return (
            <EngineLayout engineType="TMA" currentPageName="GlobalAISettings">
                <div className="p-6 max-w-3xl mx-auto">
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg">
                        Access denied. Admins only.
                    </div>
                </div>
            </EngineLayout>
        );
    }

    return (
        <EngineLayout engineType="TMA" currentPageName="GlobalAISettings">
            <div className="p-6 max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white">Global AI Settings</h1>
                
                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-lg flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5"/>
                        <p>{error}</p>
                    </div>
                )}
                
                <Card className="backdrop-blur-xl bg-black/40 border border-white/20">
                    <CardHeader>
                        <CardTitle>Core Prompts</CardTitle>
                        <CardDescription>
                            Define the core behavior and persona for the AI assistants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label htmlFor="universal-prompt" className="text-lg font-semibold text-white">Universal Prompt</Label>
                            <p className="text-sm text-gray-400 mb-2">This is the base instruction set applied to ALL assistants before their specific persona.</p>
                            <Textarea
                                id="universal-prompt"
                                value={config?.universal_prompt || ''}
                                onChange={(e) => handleInputChange('universal_prompt', e.target.value)}
                                className="h-40 bg-black/60 border-white/30 text-white"
                                placeholder="Enter universal instructions..."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/20">
                    <CardHeader>
                        <CardTitle className="text-white">MIKKI Video Analysis Prompt</CardTitle>
                        <CardDescription className="text-gray-400">
                            Customize MIKKI’s evaluation criteria and output style when analyzing videos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={config?.mikki_video_analysis_prompt || ''}
                            onChange={(e) => handleInputChange('mikki_video_analysis_prompt', e.target.value)}
                            placeholder="Enter MIKKI's video analysis instructions..."
                            className="min-h-[240px] bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                        />
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                            <span>{(config?.mikki_video_analysis_prompt || '').length} characters</span>
                            <span>Used by the Video Analysis tool (Gemini)</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/20">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-gray-400" />
                            <CardTitle className="text-white">MIKKI System Prompt</CardTitle>
                        </div>
                        <CardDescription className="text-gray-400">
                            Define MIKKI's persona and orchestration behavior. This prompt controls how MIKKI manages and delegates to other AI assistants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={config?.mikki_system_prompt || ''}
                            onChange={(e) => handleInputChange('mikki_system_prompt', e.target.value)}
                            placeholder="Enter MIKKI's system prompt..."
                            className="min-h-[300px] bg-white/10 border-white/20 text-white placeholder:text-gray-500 resize-none"
                        />
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
                            <span>{config?.mikki_system_prompt?.length || 0} characters</span>
                            <span>This defines MIKKI's orchestrator personality and delegation logic</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-black/40 border border-white/20">
                    <CardHeader>
                        <CardTitle>LLM Parameters</CardTitle>
                        <CardDescription>
                            Adjust the default creativity and randomness of the language models.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="temperature">Default Temperature</Label>
                            <Input
                                id="temperature"
                                type="number"
                                step="0.1"
                                value={config?.default_temperature || 0.7}
                                onChange={(e) => handleInputChange('default_temperature', parseFloat(e.target.value))}
                                className="bg-black/60 border-white/30 text-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">Higher values (e.g., 0.9) are more creative; lower values (e.g., 0.2) are more deterministic.</p>
                        </div>
                        <div>
                            <Label htmlFor="top-p">Default Top-P</Label>
                            <Input
                                id="top-p"
                                type="number"
                                step="0.1"
                                value={config?.default_top_p || 1.0}
                                onChange={(e) => handleInputChange('default_top_p', parseFloat(e.target.value))}
                                className="bg-black/60 border-white/30 text-white"
                            />
                            <p className="text-xs text-gray-400 mt-1">An alternative to temperature sampling. Typically not used at the same time.</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <Switch
                                id="is-active"
                                checked={config?.is_active || false}
                                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                            />
                            <Label htmlFor="is-active">AI System Active</Label>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end items-center gap-4">
                    {saveSuccess && (
                        <div className="text-green-400 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5"/>
                            <span>Saved Successfully!</span>
                        </div>
                    )}
                    <Button onClick={handleSave} disabled={isSaving} className="px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </EngineLayout>
    );
}
