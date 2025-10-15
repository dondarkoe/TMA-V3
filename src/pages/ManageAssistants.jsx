
import React, { useEffect, useMemo, useState } from "react";
import { AIAssistant } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { claudeChat } from "@/api/functions"; // Added import

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  Save,
  Edit,
  Check,
  X,
  Trash2,
  Headphones,
  Zap,
  Award,
  Palette,
  Bot,
  PlayCircle
} from "lucide-react";
import EngineLayout from "../components/layout/EngineLayout"; // Add layout import

const iconMap = { Headphones, Zap, Award, Palette, Bot };
const iconOptions = ["Headphones", "Zap", "Award", "Palette", "Bot"];

const colorOptions = [
  { label: "Blue", value: "from-blue-500 to-blue-600" },
  { label: "Orange", value: "from-orange-500 to-orange-600" },
  { label: "Emerald", value: "from-emerald-500 to-emerald-600" },
  { label: "Purple", value: "from-purple-500 to-purple-600" },
  { label: "Pink", value: "from-pink-500 to-pink-600" },
  { label: "Slate", value: "from-slate-500 to-slate-600" }
];

const prioritize = (list) => {
  const order = ["koe", "ark", "indi"];
  return [...list].sort((a, b) => {
    const ai = order.indexOf(a.assistant_id);
    const bi = order.indexOf(b.assistant_id);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });
};

// Icon helpers (Moved outside the component)
const renderIcon = (iconName, className) => {
  const Icon = iconMap[iconName] || Bot;
  return <Icon className={className} />;
};

export default function ManageAssistantsPage() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [assistants, setAssistants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});

  const [personaExpanded, setPersonaExpanded] = useState({}); // id -> bool

  // Test tool state per assistant
  const [testInputs, setTestInputs] = useState({});     // id -> prompt
  const [testLoading, setTestLoading] = useState({});   // id -> boolean
  const [testOutputs, setTestOutputs] = useState({});   // id -> string
  const [testErrors, setTestErrors] = useState({});     // id -> string

  useEffect(() => {
    const init = async () => {
      try {
        const u = await User.me();
        setUser(u);
      } catch (_) {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (user?.role !== "admin") return;
    loadAssistants();
  }, [authChecked, user]);

  const loadAssistants = async () => {
    setIsLoading(true);
    try {
      const data = await AIAssistant.list();
      setAssistants(prioritize(data || []));
    } catch (error) {
      console.error("Error loading assistants:", error);
      setAssistants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (assistant) => {
    setEditingId(assistant.id);
    setEditForm({ ...assistant });
    setErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setErrors({});
  };

  const validate = (form) => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = "Name is required.";
    if (!form.persona || !form.persona.trim()) e.persona = "Persona cannot be empty.";
    else if (form.persona.trim().length < 200) e.persona = "Persona is too short. Please provide at least 200 characters.";
    // assistant_id immutable: we do not allow editing; no need to validate uniqueness here
    if (form.icon && !iconOptions.includes(form.icon)) {
      e.icon = "Icon must be one of: " + iconOptions.join(", ");
    }
    if (form.color_class && !colorOptions.find((c) => c.value === form.color_class)) {
      e.color_class = "Color must be one of the curated gradient options.";
    }
    return e;
  };

  const saveAssistant = async () => {
    const e = validate(editForm);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    try {
      await AIAssistant.update(editingId, {
        name: editForm.name,
        description: editForm.description || "",
        persona: editForm.persona,
        color_class: editForm.color_class,
        icon: editForm.icon,
        is_active: !!editForm.is_active
        // assistant_id intentionally NOT changed
      });
      setEditingId(null);
      setEditForm({});
      await loadAssistants();
    } catch (error) {
      console.error("Error saving assistant:", error);
    }
  };

  const deleteAssistant = async (assistant) => {
    const warnActive = assistant.is_active ? "\n\nWarning: This assistant is currently active." : "";
    const confirmed = confirm(`Are you sure you want to delete ${assistant.name}? This cannot be undone.${warnActive}\n\nIn most cases, deactivating (is_active = false) is safer than deleting.`);
    if (!confirmed) return;
    try {
      await AIAssistant.delete(assistant.id);
      await loadAssistants();
    } catch (error) {
      console.error("Error deleting assistant:", error);
    }
  };

  // Add robust test runner with fallback to Claude
  const runTest = async (assistant) => {
    const id = assistant.id;
    const userMsg = (testInputs[id] || "").trim();
    if (!userMsg) {
      setTestErrors((prev) => ({ ...prev, [id]: "Enter a message to test." }));
      return;
    }
    setTestErrors((prev) => ({ ...prev, [id]: "" }));
    setTestLoading((prev) => ({ ...prev, [id]: true }));
    setTestOutputs((prev) => ({ ...prev, [id]: "" }));

    const personaSource =
      editingId === id ? (editForm.persona || assistant.persona || "You are a helpful assistant.") :
      (assistant.persona || "You are a helpful assistant.");

    const prompt = `${personaSource}

Respond to the following user message in your voice.
User: ${userMsg}
Your response:`;

    try {
      const res = await InvokeLLM({ prompt });
      const text = typeof res === "string" ? res : (res?.response || "");
      setTestOutputs((prev) => ({ ...prev, [id]: text || "(No content returned)" }));
    } catch (_e) { // Catch error from InvokeLLM
      try {
        const { data } = await claudeChat({ prompt }); // Try claudeChat as fallback
        setTestOutputs((prev) => ({ ...prev, [id]: data?.response || "(No response)" }));
      } catch (_e2) { // Catch error from claudeChat as well
        setTestErrors((prev) => ({ ...prev, [id]: "AI service is temporarily unavailable. Please try again later." }));
      }
    } finally {
      setTestLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (!authChecked || isLoading) {
    return (
      <EngineLayout engineType="TMA" currentPageName="ManageAssistants" defaultTool="manage-assistants">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse space-y-4 w-full p-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-48 backdrop-blur-xl bg-black/40 border border-white/10">
                  <CardContent className="p-6">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
                    <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </EngineLayout>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <EngineLayout engineType="TMA" currentPageName="ManageAssistants" defaultTool="manage-assistants">
        <div className="h-full flex items-center justify-center p-6">
          <Card className="max-w-xl w-full backdrop-blur-xl bg-black/50 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Not authorized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">You need an admin account to manage AI assistants.</p>
            </CardContent>
          </Card>
        </div>
      </EngineLayout>
    );
  }

  return (
    <EngineLayout engineType="TMA" currentPageName="ManageAssistants" defaultTool="manage-assistants">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Manage AI Assistants
            </h1>
            <p className="text-gray-300">
              Define, edit, activate/deactivate, and delete AI personas. Changes apply to new chat responses immediately.
            </p>
          </div>

          {assistants.length === 0 ? (
            <Card className="backdrop-blur-xl bg-black/50 border border-white/10">
              <CardContent className="p-6">
                <p className="text-gray-300">No assistants found. Seed KOE, ARK, and INDI in the AIAssistant entity.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {assistants.map((assistant) => {
                const isEditing = editingId === assistant.id;

                return (
                  <Card key={assistant.id} className="backdrop-blur-xl bg-black/50 border border-white/10">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-r ${isEditing ? (editForm.color_class || assistant.color_class) : assistant.color_class} flex items-center justify-center`}>
                              {renderIcon(isEditing ? (editForm.icon || assistant.icon) : assistant.icon, "w-4 h-4 text-white")}
                            </div>
                            <span className="text-lg text-white">{isEditing ? (editForm.name || "") : assistant.name}</span>
                            <Badge variant={assistant.is_active ? "default" : "secondary"}>
                              {assistant.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                          {!isEditing && <p className="text-gray-300 mt-1">{assistant.description}</p>}
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <Button onClick={saveAssistant} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Check className="w-4 h-4 mr-2" /> Save
                              </Button>
                              <Button onClick={cancelEditing} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                <X className="w-4 h-4 mr-2" /> Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button onClick={() => startEditing(assistant)} size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </Button>
                              <Button onClick={() => deleteAssistant(assistant)} size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      {isEditing ? (
                        <>
                          {/* assistant_id is immutable */}
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Assistant ID (immutable)</label>
                              <Input value={assistant.assistant_id} disabled className="bg-white/10 text-white/80" />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Name</label>
                              <Input
                                value={editForm.name || ""}
                                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="KOE"
                              />
                              {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm text-gray-300 mb-1">Description</label>
                              <Input
                                value={editForm.description || ""}
                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Short UI helper text"
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Icon</label>
                              <Select
                                value={editForm.icon || assistant.icon || "Bot"}
                                onValueChange={(v) => setEditForm((f) => ({ ...f, icon: v }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose icon" />
                                </SelectTrigger>
                                <SelectContent>
                                  {iconOptions.map((opt) => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.icon && <p className="text-sm text-red-400 mt-1">{errors.icon}</p>}
                            </div>

                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Color</label>
                              <Select
                                value={editForm.color_class || assistant.color_class || colorOptions[0].value}
                                onValueChange={(v) => setEditForm((f) => ({ ...f, color_class: v }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose color" />
                                </SelectTrigger>
                                <SelectContent>
                                  {colorOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.color_class && <p className="text-sm text-red-400 mt-1">{errors.color_class}</p>}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-sm text-gray-300 mb-1">Active</label>
                                <div className="flex items-center gap-3">
                                  <Switch
                                    checked={!!editForm.is_active}
                                    onCheckedChange={(val) => setEditForm((f) => ({ ...f, is_active: val }))}
                                  />
                                  <span className="text-sm text-gray-300">{editForm.is_active ? "Active" : "Inactive"}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-300 mb-1">Persona (system prompt)</label>
                            <Textarea
                              value={editForm.persona || ""}
                              onChange={(e) => setEditForm((f) => ({ ...f, persona: e.target.value }))}
                              placeholder="Full persona instructions..."
                              className="min-h-[300px] font-mono"
                            />
                            {errors.persona && <p className="text-sm text-red-400 mt-1">{errors.persona}</p>}
                          </div>

                          {/* Test tool in edit mode */}
                          <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-4 h-4 text-gray-200" />
                              <span className="font-medium text-gray-100">Test Response (unsaved changes apply here)</span>
                            </div>
                            <Input
                              placeholder="Try a sample user message..."
                              value={testInputs[assistant.id] || ""}
                              onChange={(e) => setTestInputs((prev) => ({ ...prev, [assistant.id]: e.target.value }))}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => runTest(assistant)}
                                disabled={!!testLoading[assistant.id]}
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                {testLoading[assistant.id] ? "Testing..." : "Run Test"}
                              </Button>
                              {testErrors[assistant.id] && <span className="text-sm text-red-400">{testErrors[assistant.id]}</span>}
                            </div>
                            {testOutputs[assistant.id] && (
                              <pre className="bg-black/50 rounded-md p-3 text-sm text-gray-100 whitespace-pre-wrap max-h-60 overflow-auto border border-white/10">{testOutputs[assistant.id]}</pre>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Collapsible persona viewer */}
                          <div className="rounded-lg border border-white/10">
                            <button
                              onClick={() =>
                                setPersonaExpanded((s) => ({ ...s, [assistant.id]: !s[assistant.id] }))
                              }
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5"
                            >
                              <span className="font-medium text-gray-100">Current Persona</span>
                              <span className="text-sm text-gray-400">
                                {personaExpanded[assistant.id] ? "Hide" : "Show"}
                              </span>
                            </button>
                            {personaExpanded[assistant.id] && (
                              <div className="p-3 border-t border-white/10">
                                <pre className="bg-black/40 rounded-md p-3 text-sm text-gray-100 whitespace-pre-wrap max-h-64 overflow-auto font-mono">
                                  {assistant.persona || "(No persona set)"}
                                </pre>
                              </div>
                            )}
                          </div>

                          {/* Test tool in read-only mode */}
                          <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-4 h-4 text-gray-200" />
                              <span className="font-medium text-gray-100">Test Response</span>
                            </div>
                            <Input
                              placeholder="Try a sample user message..."
                              value={testInputs[assistant.id] || ""}
                              onChange={(e) => setTestInputs((prev) => ({ ...prev, [assistant.id]: e.target.value }))}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => runTest(assistant)}
                                disabled={!!testLoading[assistant.id]}
                                className="bg-indigo-600 hover:bg-indigo-700"
                              >
                                {testLoading[assistant.id] ? "Testing..." : "Run Test"}
                              </Button>
                              {testErrors[assistant.id] && <span className="text-sm text-red-400">{testErrors[assistant.id]}</span>}
                            </div>
                            {testOutputs[assistant.id] && (
                              <pre className="bg-black/50 rounded-md p-3 text-sm text-gray-100 whitespace-pre-wrap max-h-60 overflow-auto border border-white/10">{testOutputs[assistant.id]}</pre>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </EngineLayout>
  );
}
