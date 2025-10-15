import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Image as ImageIcon, 
  Copy, 
  Check,
  ArrowLeft,
  Sparkles,
  Layers,
  Zap
} from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const orbTypes = [
  {
    id: 'hero',
    name: 'Hero Orb',
    description: 'Single centered orb for main backgrounds',
    icon: Sparkles,
    usage: 'KOE Dashboard, large background element'
  },
  {
    id: 'atmospheric',
    name: 'Atmospheric Orbs', 
    description: 'Multiple orbs composition for ambient effects',
    icon: Layers,
    usage: 'Loading states, processing animations'
  },
  {
    id: 'accent',
    name: 'Accent Orbs',
    description: 'Three orbs with lighting for section backgrounds',
    icon: Zap,
    usage: 'Analysis results, metric card backgrounds'
  }
];

export default function OrbUploadPage() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState({});
  const [uploading, setUploading] = useState({});
  const [copied, setCopied] = useState({});
  const fileInputRefs = {
    hero: useRef(null),
    atmospheric: useRef(null),
    accent: useRef(null)
  };

  const handleFileUpload = async (orbType, file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    setUploading(prev => ({ ...prev, [orbType]: true }));
    
    try {
      const { file_url } = await UploadFile({ file });
      setUploads(prev => ({ 
        ...prev, 
        [orbType]: { 
          url: file_url, 
          filename: file.name,
          size: (file.size / 1024 / 1024).toFixed(2)
        }
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [orbType]: false }));
    }
  };

  const copyToClipboard = (orbType, url) => {
    navigator.clipboard.writeText(url);
    setCopied(prev => ({ ...prev, [orbType]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [orbType]: false }));
    }, 2000);
  };

  const allUploaded = orbTypes.every(orb => uploads[orb.id]);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(createPageUrl("KOE"))}
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 
                className="text-3xl text-white font-bold"
                style={{
                  fontFamily: "'Teko', sans-serif",
                  fontWeight: 500,
                  textShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                }}
              >
                KOE Orb Asset Manager
              </h1>
              <p className="text-sky-300 tracking-wider">Upload your custom prismatic orb designs</p>
            </div>
          </div>
          
          {allUploaded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Button
                onClick={() => navigate(createPageUrl("KOE"))}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 font-semibold"
              >
                <Check className="w-4 h-4 mr-2" />
                Complete Setup
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {orbTypes.map((orb, index) => {
            const Icon = orb.icon;
            const isUploaded = uploads[orb.id];
            const isUploading = uploading[orb.id];
            const isCopied = copied[orb.id];
            
            return (
              <motion.div
                key={orb.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="backdrop-blur-xl bg-black/50 border border-sky-500/20 shadow-2xl h-full">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-500/20 backdrop-blur-xl border border-sky-500/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{orb.name}</CardTitle>
                        <p className="text-sky-300 text-sm">{orb.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-sky-400 border-sky-500/30 w-fit">
                      {orb.usage}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <input
                      ref={fileInputRefs[orb.id]}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleFileUpload(orb.id, e.target.files[0])}
                      className="hidden"
                    />
                    
                    {!isUploaded ? (
                      <Button
                        onClick={() => fileInputRefs[orb.id].current?.click()}
                        disabled={isUploading}
                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 py-6"
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </div>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 mr-2" />
                            Upload {orb.name}
                          </>
                        )}
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-sky-400" />
                            <span className="text-sky-300 font-medium">Upload Complete</span>
                          </div>
                          <p className="text-white text-sm truncate">{isUploaded.filename}</p>
                          <p className="text-sky-400 text-xs">{isUploaded.size} MB</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-black/40 border border-sky-500/20">
                          <p className="text-white/70 text-xs mb-2">File URL:</p>
                          <div className="flex items-center gap-2">
                            <Input
                              value={isUploaded.url}
                              readOnly
                              className="text-xs bg-transparent border-sky-500/30 text-sky-300"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(orb.id, isUploaded.url)}
                              className={`border-sky-500/30 transition-colors ${
                                isCopied ? 'text-green-400 border-green-400' : 'text-sky-400'
                              }`}
                            >
                              {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => fileInputRefs[orb.id].current?.click()}
                          variant="outline"
                          className="w-full border-sky-500/30 text-sky-300 hover:bg-sky-500/10"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Replace Image
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <Card className="backdrop-blur-xl bg-black/40 border border-sky-500/20">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                Integration Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="text-sky-300 font-medium mb-2">Hero Orb Usage</h4>
                  <ul className="text-white/70 space-y-1 text-xs">
                    <li>• KOE Dashboard background</li>
                    <li>• Center positioning</li>
                    <li>• Breathing animation (scale 1.0-1.05)</li>
                    <li>• background-size: contain</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sky-300 font-medium mb-2">Atmospheric Orbs</h4>
                  <ul className="text-white/70 space-y-1 text-xs">
                    <li>• Loading states</li>
                    <li>• Processing animations</li>
                    <li>• Rotate/pulse effects</li>
                    <li>• Ambient backgrounds</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sky-300 font-medium mb-2">Accent Orbs</h4>
                  <ul className="text-white/70 space-y-1 text-xs">
                    <li>• Analysis results sections</li>
                    <li>• Metric card backgrounds</li>
                    <li>• Blend mode: overlay</li>
                    <li>• Subtle prismatic effects</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}