
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArtistProductionStyle } from '@/api/entities';
import { User } from '@/api/entities';
import { Loader2, UploadCloud, CheckCircle, XCircle, AlertTriangle, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function UploadArtistStylesPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [jsonInput, setJsonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadStats, setUploadStats] = useState(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        
        // This is a placeholder for actual authorization logic.
        // In a real application, you would check `currentUser.role` or `currentUser.id`
        // against a list of authorized roles/IDs.
        // For now, it's hardcoded to `true` but you should replace 'your-user-id-here'
        // with an actual user ID or implement proper role-based access control.
        const authorizedUserIds = [
          'your-user-id-here', // Replace with an actual authorized user ID
          currentUser?.id
        ];
        
        const authorized = true; // For demonstration, assuming authorization is true.
                               // In production, uncomment the line below and adjust:
                               // authorizedUserIds.includes(currentUser?.id) || currentUser?.role === 'admin';
        
        setIsAuthorized(authorized);
        
        if (!authorized) {
          setTimeout(() => {
            navigate(createPageUrl('Dashboard'));
          }, 3000);
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
        setTimeout(() => {
          navigate(createPageUrl('Dashboard'));
        }, 3000);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonInput(event.target.result);
      };
      reader.readAsText(selectedFile);
    } else {
      setJsonInput('');
    }
  };

  const tryParseArtistStyle = (item) => {
    const mapped = {};
    
    mapped.artist_name = item.artist_name || item.artistName || item.name || item.artist || '';
    mapped.artist_description = item.artist_description || item.artistDescription || item.description || item.bio || item.overview || '';
    mapped.distinctive_elements_summary = item.distinctive_elements_summary || item.distinctiveElements || item.signature_elements || item.key_elements || item.style_summary || '';
    mapped.reference_track_youtube_url = item.reference_track_youtube_url || item.referenceTrack || item.youtube_url || item.reference_url || item.track_url || '';
    
    let genres = item.genre_focus || item.genres || item.genre || item.style || [];
    if (typeof genres === 'string') {
      genres = genres.split(',').map(g => g.trim()).filter(Boolean);
    }
    mapped.genre_focus = Array.isArray(genres) ? genres : [genres].filter(Boolean);
    
    let difficulty = item.overall_difficulty_level || item.difficulty || item.level || item.complexity || 'Intermediate';
    if (typeof difficulty === 'string') {
      difficulty = difficulty.toLowerCase();
      if (difficulty.includes('beginner') || difficulty.includes('easy') || difficulty.includes('basic')) {
        difficulty = 'Beginner';
      } else if (difficulty.includes('expert') || difficulty.includes('master') || difficulty.includes('pro')) {
        difficulty = 'Expert';
      } else if (difficulty.includes('advanced') || difficulty.includes('hard')) {
        difficulty = 'Advanced';
      } else {
        difficulty = 'Intermediate';
      }
    }
    mapped.overall_difficulty_level = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    let tools = item.common_plugins_and_tools || item.plugins || item.tools || item.software || item.daw || [];
    if (typeof tools === 'string') {
      tools = tools.split(',').map(t => t.trim()).filter(Boolean);
    }
    mapped.common_plugins_and_tools = Array.isArray(tools) ? tools : [tools].filter(Boolean);
    
    let breakdown = item.style_breakdown || item.breakdown || item.techniques || item.sections || item.methods || [];
    if (!Array.isArray(breakdown)) {
      breakdown = [];
    }
    
    mapped.style_breakdown = breakdown.map(section => {
      const mappedSection = {
        section_title: section.section_title || section.title || section.name || 'Technique Section',
        section_description: section.section_description || section.description || section.desc || '',
        techniques_and_tips: []
      };
      
      let techniques = section.techniques_and_tips || section.techniques || section.tips || section.methods || section.steps || [];
      if (!Array.isArray(techniques)) {
        techniques = [];
      }
      
      mappedSection.techniques_and_tips = techniques.map(tech => {
        const mappedTech = {
          title: tech.title || tech.name || tech.technique || 'Technique',
          description: tech.description || tech.desc || tech.summary || '',
          example_audio_context: tech.example_audio_context || tech.audio_example || tech.timestamp || null,
          target_software_examples: Array.isArray(tech.target_software_examples) ? tech.target_software_examples : (tech.software || tech.daw || []).filter(Boolean),
          steps: []
        };
        
        let steps = tech.steps || tech.instructions || tech.process || [];
        if (!Array.isArray(steps)) {
          steps = [];
        }
        
        mappedTech.steps = steps.map((step, index) => {
          const mappedStep = {
            step_number: step.step_number || index + 1,
            title: step.title || step.name || `Step ${index + 1}`,
            do_items: [],
            notes: step.notes || step.note || step.tip || null
          };
          
          let doItems = step.do_items || step.actions || step.instructions || [];
          if (!Array.isArray(doItems)) {
            if (typeof step === 'string') {
              doItems = [{ action: step }];
            } else if (step && typeof step === 'object' && step.action) {
              doItems = [step];
            } else {
              doItems = [];
            }
          }
          
          mappedStep.do_items = doItems.map(item => ({
            action: item.action || item.instruction || item.do || item.step || '',
            settings: item.settings || item.params || item.parameters || null,
            listen_for: item.listen_for || item.result || item.effect || null,
            reason: item.reason || item.why || item.purpose || null
          }));
          
          return mappedStep;
        });
        
        return mappedTech;
      });
      
      return mappedSection;
    });
    
    return mapped;
  };

  const tryParseSoundRecipe = (item) => {
    const mapped = {};
    
    mapped.name = item.name || item.title || item.sound_name || item.recipe_name || '';
    mapped.description = item.description || item.desc || item.summary || '';
    
    let genres = item.genre_tags || item.genres || item.genre || item.style || [];
    if (typeof genres === 'string') {
      genres = genres.split(',').map(g => g.trim()).filter(Boolean);
    }
    mapped.genre_tags = Array.isArray(genres) ? genres : [genres].filter(Boolean);
    
    mapped.instrument_type = item.instrument_type || item.instrument || item.type || item.category || 'Synth';
    
    let difficulty = item.difficulty || item.level || item.complexity || 'Intermediate';
    if (typeof difficulty === 'string') {
      difficulty = difficulty.toLowerCase();
      if (difficulty.includes('beginner') || difficulty.includes('easy')) {
        difficulty = 'Beginner';
      } else if (difficulty.includes('advanced') || difficulty.includes('hard')) {
        difficulty = 'Advanced';
      } else {
        difficulty = 'Intermediate';
      }
    }
    mapped.difficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    mapped.preview_audio_url = item.preview_audio_url || item.audio_url || item.preview || item.sample || '';
    
    let plugins = item.required_plugins || item.plugins || item.software || item.tools || [];
    if (typeof plugins === 'string') {
      plugins = plugins.split(',').map(p => p.trim()).filter(Boolean);
    }
    mapped.required_plugins = Array.isArray(plugins) ? plugins : [plugins].filter(Boolean);
    
    let tutorials = item.tutorial_content || item.tutorials || item.instructions || item.steps || [];
    if (!Array.isArray(tutorials)) {
      tutorials = [];
    }
    
    mapped.tutorial_content = tutorials.map(tutorial => {
      const mappedTutorial = {
        software: tutorial.software || tutorial.daw || tutorial.plugin || 'DAW',
        prerequisites: tutorial.prerequisites || tutorial.requirements || tutorial.needs || 'Basic knowledge',
        steps: []
      };

      let tutorialSteps = tutorial.steps || tutorial.instructions || [];
      if (!Array.isArray(tutorialSteps)) {
        tutorialSteps = [];
      }
      
      mappedTutorial.steps = tutorialSteps.map((step, index) => {
        const mappedStep = {
          step_number: step.step_number || index + 1,
          title: step.title || step.name || `Step ${index + 1}`,
          do_items: [],
          notes: step.notes || step.note || null
        };

        let doItems = step.do_items || step.actions || step.instructions || [];
        if (!Array.isArray(doItems)) {
            if (typeof step === 'string') {
                doItems = [{ action: step }];
            } else if (step && typeof step === 'object' && step.action) {
                doItems = [step];
            } else {
                doItems = [];
            }
        }
        
        mappedStep.do_items = doItems.map(item => ({
          action: item.action || item.instruction || '',
          settings: item.settings || item.params || null,
          listen_for: item.listen_for || item.result || null,
          reason: item.reason || item.why || null
        }));
        
        return mappedStep;
      });
      return mappedTutorial;
    });
    
    return mapped;
  };

  const detectDataType = (data) => {
    const items = Array.isArray(data) ? data : [data];
    
    if (items.length === 0) {
      return null;
    }

    const firstItem = items[0];
    console.log('Detecting data type for item:', firstItem);
    
    // Enhanced detection for artist styles
    const artistIndicators = [
      'artist_name', 'artistName', 'artist', 
      'style_breakdown', 'breakdown', 'techniques_and_tips',
      'reference_track_youtube_url', 'referenceTrack'
    ];
    
    // Enhanced detection for sound recipes
    const recipeIndicators = [
      'preview_audio_url', 'audio_url', 'preview', 
      'tutorial_content', 'tutorials', 'tutorial', 
      'instrument_type', 'instrument', 
      'required_plugins', 'plugins',
      'genre_tags',
      'difficulty'
    ];
    
    const hasArtistFields = artistIndicators.some(field => 
      Object.keys(firstItem).includes(field) || 
      (firstItem.hasOwnProperty(field) && firstItem[field] !== null && firstItem[field] !== '')
    );
    
    const hasRecipeFields = recipeIndicators.some(field => 
      Object.keys(firstItem).includes(field) || 
      (firstItem.hasOwnProperty(field) && firstItem[field] !== null && firstItem[field] !== '')
    );
    
    console.log('Has artist fields:', hasArtistFields);
    console.log('Has recipe fields:', hasRecipeFields);
    
    // Priority logic for detection
    if (hasArtistFields && !hasRecipeFields) {
      console.log('Detected as: artist_styles (clear artist indicators)');
      return 'artist_styles';
    }
    
    if (hasRecipeFields && !hasArtistFields) {
      console.log('Detected as: sound_recipes (clear recipe indicators)');
      return 'sound_recipes';
    }
    
    // Fallback detection based on common patterns
    if (firstItem.name || firstItem.title) {
      // If it has a 'name' or 'title', lean towards sound recipe unless clearly an artist
      if (firstItem.artist_name || firstItem.artistName || firstItem.style_breakdown) {
        console.log('Detected as: artist_styles (name/title + artist fields)');
        return 'artist_styles';
      } else {
        console.log('Detected as: sound_recipes (has name/title, no clear artist fields)');
        return 'sound_recipes';
      }
    }
    
    // Check for specific combinations that indicate sound recipes
    if (firstItem.instrument_type || firstItem.genre_focus || firstItem.common_plugins_and_tools || firstItem.overall_difficulty_level) {
      console.log('Detected as: sound_recipes (has recipe-specific fields)');
      return 'sound_recipes';
    }
    
    // Check for specific combinations that indicate artist styles
    if (firstItem.artist || firstItem.genre_focus || firstItem.common_plugins_and_tools) {
      // This could be either, but if it has distinctive artist markers, assume artist
      if (firstItem.artist || firstItem.artist_name || firstItem.artistName) {
        console.log('Detected as: artist_styles (has artist identifier)');
        return 'artist_styles';
      }
    }
    
    // If we still can't determine, default to sound_recipes for generic music production content
    if (Object.keys(firstItem).length > 0) {
      console.log('Detected as: sound_recipes (fallback for generic content)');
      return 'sound_recipes';
    }
    
    console.log('Could not detect data type');
    return null;
  };

  const cleanAndParseJSON = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.log('Initial JSON parse failed, trying to clean:', error.message);
      
      let cleaned = jsonString.trim();
      
      const jsonStart = cleaned.indexOf('{');
      const jsonArrayStart = cleaned.indexOf('[');
      let actualStart = -1;
      
      if (jsonStart !== -1 && jsonArrayStart !== -1) {
        actualStart = Math.min(jsonStart, jsonArrayStart);
      } else if (jsonStart !== -1) {
        actualStart = jsonStart;
      } else if (jsonArrayStart !== -1) {
        actualStart = jsonArrayStart;
      }
      
      if (actualStart > 0) {
        cleaned = cleaned.substring(actualStart);
      }
      
      let depth = 0;
      let inString = false;
      let escaped = false;
      let endPos = cleaned.length;
      
      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        
        if (escaped) {
          escaped = false;
          continue;
        }
        
        if (char === '\\') {
          escaped = true;
          continue;
        }
        
        if (char === '"' && !escaped) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{' || char === '[') {
            depth++;
          } else if (char === '}' || char === ']') {
            depth--;
            if (depth === 0) {
              endPos = i + 1;
              break;
            }
          }
        }
      }
      
      cleaned = cleaned.substring(0, endPos);
      
      try {
        return JSON.parse(cleaned);
      } catch (secondError) {
        console.log('Second JSON parse attempt failed:', secondError.message);
        
        cleaned = cleaned.replace(/,(?=\s*[}\]])/g, '');
        
        try {
          return JSON.parse(cleaned);
        } catch (thirdError) {
          throw new Error(`Could not parse JSON: ${thirdError.message}. Original text starts with: "${jsonString.substring(0, Math.min(100, jsonString.length))}..."`);
        }
      }
    }
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setMessage(null);
    setUploadStats(null);

    if (!jsonInput.trim()) {
      setMessage({ type: 'error', text: 'Please paste JSON data or select a file.' });
      setIsLoading(false);
      return;
    }

    try {
      let parsedData = cleanAndParseJSON(jsonInput);
      
      if (!Array.isArray(parsedData)) {
        console.log('Converting single object to array');
        parsedData = [parsedData];
      }

      if (parsedData.length === 0) {
        setMessage({ type: 'error', text: 'JSON contains no data to process.' });
        setIsLoading(false);
        return;
      }

      console.log(`Processing ${parsedData.length} items`);

      const dataType = detectDataType(parsedData);
      
      if (!dataType) {
        setMessage({ type: 'error', text: 'Could not determine data type. The JSON should contain either artist information or sound recipe information.' });
        setIsLoading(false);
        return;
      }

      console.log(`Detected data type: ${dataType}`);

      const successfulUploads = [];
      const failedUploads = [];
      let entityToUse, parseFunction, itemNameField;

      if (dataType === 'artist_styles') {
        entityToUse = ArtistProductionStyle;
        parseFunction = tryParseArtistStyle;
        itemNameField = 'artist_name';
      } else if (dataType === 'sound_recipes') {
        const { SoundRecipe } = await import('@/api/entities');
        entityToUse = SoundRecipe;
        parseFunction = tryParseSoundRecipe;
        itemNameField = 'name';
      }

      for (let i = 0; i < parsedData.length; i++) {
        const item = parsedData[i];
        try {
          const mappedItem = parseFunction(item);
          
          if (!mappedItem[itemNameField] || mappedItem[itemNameField].trim() === '') {
            throw new Error(`Missing or empty identifier field: "${itemNameField}"`);
          }
          
          console.log(`Attempting to create ${dataType} item:`, mappedItem);
          
          const created = await entityToUse.create(mappedItem);
          successfulUploads.push({
            name: mappedItem[itemNameField] || `Item ${i + 1}`,
            id: created.id
          });
        } catch (error) {
          console.error('Failed to upload item:', item, error);
          failedUploads.push({
            name: item.artist_name || item.name || item.title || `Item ${i + 1}`,
            error: error.message || 'Unknown error',
            originalData: item
          });
        }
      }

      setUploadStats({
        total: parsedData.length,
        successful: successfulUploads.length,
        failed: failedUploads.length,
        dataType: dataType
      });

      const dataTypeLabel = dataType === 'artist_styles' ? 'artist styles' : 'sound recipes';

      if (successfulUploads.length > 0) {
        setMessage({
          type: 'success',
          text: `Successfully uploaded ${successfulUploads.length} ${dataTypeLabel}!`
        });
      }
      
      if (failedUploads.length > 0) {
        console.log('Failed uploads details:', failedUploads);
        const errorSummary = failedUploads.slice(0, 3).map(f => `${f.name}: ${f.error}`).join('; ');
        const moreErrors = failedUploads.length > 3 ? ` (and ${failedUploads.length - 3} more)` : '';
        
        setMessage(prev => ({
          type: prev?.type === 'success' ? 'warning' : 'error',
          text: `${prev?.text ? prev.text + ' ' : ''}Failed to upload ${failedUploads.length} ${dataTypeLabel}: ${errorSummary}${moreErrors}. Check browser console for full details.`
        }));
      }

      if (successfulUploads.length > 0) {
        setJsonInput('');
        setFile(null);
      }
      
    } catch (err) {
      setMessage({ type: 'error', text: `Invalid JSON format: ${err.message}. Please check your JSON syntax.` });
      console.error('JSON parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          Checking access permissions...
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <Card className="backdrop-blur-xl bg-black/60 border border-red-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300 mb-4">
              You don't have permission to access this upload interface.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-xl bg-black/60 border border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              Upload Artist Styles & Sound Recipes
            </CardTitle>
            <p className="text-gray-400 text-sm">
              Admin interface for uploading JSON knowledge base files. Supports flexible JSON formats - the system will try to intelligently parse your data.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {uploadStats && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-300">
                    {uploadStats.dataType === 'artist_styles' ? 'Artist Styles' : 'Sound Recipes'}
                  </div>
                  <div className="text-xs text-gray-400">Data Type</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-300">{uploadStats.total}</div>
                  <div className="text-xs text-gray-400">Total Items</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-300">{uploadStats.successful}</div>
                  <div className="text-xs text-gray-400">Successful</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-300">{uploadStats.failed}</div>
                  <div className="text-xs text-gray-400">Failed</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Upload JSON File:</label>
              <Input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:text-white file:border-0 file:rounded"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Or paste JSON directly:</label>
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste JSON array here... The system will try to intelligently parse any reasonable JSON format."
                className="bg-gray-800 border-gray-600 text-white min-h-[200px] font-mono text-xs"
                disabled={isLoading}
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={isLoading || (!jsonInput.trim() && !file)}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing & Parsing...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Parse & Upload to Database
                </>
              )}
            </Button>

            {message && (
              <Alert className={`${
                message.type === 'success' ? 'border-green-500/50 bg-green-500/10' : 
                message.type === 'error' ? 'border-red-500/50 bg-red-500/10' :
                'border-yellow-500/50 bg-yellow-500/10'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {message.type === 'error' && <XCircle className="h-4 w-4 text-red-400" />}
                  {message.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  <AlertDescription className={`${
                    message.type === 'success' ? 'text-green-300' : 
                    message.type === 'error' ? 'text-red-300' : 'text-yellow-300'
                  } text-sm`}>
                    {message.text}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white text-sm font-semibold mb-2">💡 Flexible Upload Help</h4>
              <div className="text-gray-400 text-xs space-y-2">
                <p><strong>Single Objects or Arrays:</strong> You can paste either a single object or an array</p>
                <p><strong>Artist Styles:</strong> Should ideally include artist names, descriptions, and techniques/breakdowns.</p>
                <p><strong>Sound Recipes:</strong> Should ideally include sound names, audio previews, and tutorial instructions.</p>
                <p><strong>Field Names:</strong> The system will try to map common variations automatically.</p>
                <p><strong>Debugging:</strong> For failed uploads, check the browser console for full details.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
