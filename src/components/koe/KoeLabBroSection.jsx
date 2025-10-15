
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Download, 
    Wifi, 
    WifiOff, 
    Monitor, 
    Zap, 
    Clock,
    Music2,
    Settings
} from 'lucide-react';
import { KoeLabSession } from '@/api/entities';
import { getConnectionToken } from '@/api/functions'; // Added this import

export default function KoeLabBroSection() {
    const [labSession, setLabSession] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('offline');
    const [currentProject, setCurrentProject] = useState(null);

    // Load lab session data and check connection status
    useEffect(() => {
        loadLabSession();
        
        // Set up interval to check connection status
        const interval = setInterval(() => {
            checkConnectionStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadLabSession = async () => {
        try {
            const sessions = await KoeLabSession.list('-created_date', 1);
            if (sessions.length > 0) {
                setLabSession(sessions[0]);
                checkConnectionStatus(sessions[0]);
            }
        } catch (error) {
            console.log('No lab session found');
        }
    };

    const checkConnectionStatus = async (session = labSession) => {
        if (!session) return;

        try {
            const now = new Date();
            const lastPing = new Date(session.last_ping);
            const timeDiff = (now - lastPing) / 1000; // seconds

            if (session.is_connected && timeDiff < 30) {
                setConnectionStatus('connected');
                setCurrentProject({
                    name: session.current_project_name,
                    data: session.current_project_data
                });
            } else {
                setConnectionStatus('offline');
                setCurrentProject(null);
            }
        } catch (error) {
            setConnectionStatus('offline');
            setCurrentProject(null);
        }
    };

    const handleDownloadKoennector = async (platform = 'mac') => {
        setIsDownloading(true);
        try {
            console.log(`Starting download for ${platform} platform`);
            
            // Get connection token using the function import
            const response = await getConnectionToken({});
            console.log('Token response:', response);

            if (!response.data || !response.data.success) {
                throw new Error(response.data?.message || response.data?.error || 'Failed to get connection token');
            }

            const connectionCode = response.data.connection_token;
            
            // __init__.py content
            const initPyContent = `from .KOE import KOE

def create_instance(c_instance):
    return KOE(c_instance)`;

            // KOE.py content with connection code injected
            const koePyContent = `from _Framework.ControlSurface import ControlSurface
import json
import urllib2
import threading
import time

class KOE(ControlSurface):
    def __init__(self, c_instance):
        ControlSurface.__init__(self, c_instance)
        self.log_message('KOENNECTOR ULTIMATE: Connecting to KOE LAB BRO...')
        self._song = self.song()
        self._last_selected_track = None
        self._last_snapshot_time = 0
        self._pending_changes = []
        
        # Connection code injected by Base44
        self.connection_code = '${connectionCode}'
        
        # Initialize listeners
        self._setup_listeners()
        
        # Take initial snapshot
        self.schedule_message(1, self.take_snapshot)
        
    def _setup_listeners(self):
        """Setup all necessary listeners for real-time monitoring"""
        try:
            # Track selection listener
            self._song.view.add_selected_track_listener(self._on_track_selected)
            
            # Transport listeners
            self._song.add_is_playing_listener(self._on_transport_change)
            self._song.add_current_song_time_listener(self._on_song_time_change)
            
            # Track listeners
            self._song.add_tracks_listener(self._on_tracks_change)
            
        except Exception as e:
            self.log_message(f'Listener setup error: {e}')
    
    def _on_track_selected(self):
        """Handle track selection change"""
        current_track = self._song.view.selected_track
        if current_track != self._last_selected_track:
            self._last_selected_track = current_track
            self.take_snapshot()
    
    def _on_transport_change(self):
        """Handle transport state changes"""
        self.take_snapshot()
    
    def _on_song_time_change(self):
        """Handle song time changes (throttled)"""
        current_time = time.time()
        if current_time - self._last_snapshot_time > 2.0:  # Throttle to every 2 seconds
            self.take_snapshot()
    
    def _on_tracks_change(self):
        """Handle track changes"""
        self.take_snapshot()
    
    def _send_to_base44(self, snapshot_data):
        """Send project data to Base44 EngineOS KOE LAB BRO"""
        try:
            # Base44 KOE LAB BRO endpoint
            url = '${window.location.origin}/functions/koeSnapshot'
            
            payload = {
                'connection_token': self.connection_code,
                'project_data': snapshot_data,
                'koennector_version': 'ultimate'
            }
            
            json_data = json.dumps(payload, default=str)
            req = urllib2.Request(url, json_data, {
                'Content-Type': 'application/json'
            })
            
            response = urllib2.urlopen(req, timeout=5)
            self.log_message('KOE LAB BRO: Ultimate data sent successfully')
            self._last_snapshot_time = time.time()
            
        except Exception as e:
            self.log_message(f'KOENNECTOR Ultimate Error: {e}')
    
    def _get_project_name(self):
        """Get current project name"""
        try:
            return str(self._song.get_data().get('name', 'Untitled Project'))
        except:
            return 'Live Project'
    
    def _get_device_parameters(self, device):
        """Extract all parameters from a device"""
        parameters = {}
        try:
            for i, param in enumerate(device.parameters):
                if param and hasattr(param, 'value'):
                    param_info = {
                        'value': float(param.value),
                        'min': float(param.min),
                        'max': float(param.max),
                        'name': str(param.name),
                        'is_enabled': bool(param.is_enabled) if hasattr(param, 'is_enabled') else True,
                        'automation_state': str(param.automation_state) if hasattr(param, 'automation_state') else 'none'
                    }
                    parameters[str(param.name)] = param_info
        except Exception as e:
            self.log_message(f'Device parameter error: {e}')
        return parameters
    
    def _get_device_info(self, device, device_index):
        """Get comprehensive device information"""
        try:
            device_info = {
                'index': device_index,
                'name': str(device.name),
                'class_name': str(device.class_name),
                'is_enabled': bool(device.is_enabled) if hasattr(device, 'is_enabled') else True,
                'parameters': self._get_device_parameters(device)
            }
            
            # Check for rack devices with chains
            if hasattr(device, 'chains') and device.chains:
                device_info['chains'] = []
                for chain_idx, chain in enumerate(device.chains):
                    chain_info = {
                        'index': chain_idx,
                        'name': str(chain.name),
                        'devices': []
                    }
                    for nested_device_idx, nested_device in enumerate(chain.devices):
                        nested_info = self._get_device_info(nested_device, nested_device_idx)
                        chain_info['devices'].append(nested_info)
                    device_info['chains'].append(chain_info)
            
            return device_info
        except Exception as e:
            return {'name': str(device.name), 'error': str(e)}
    
    def _get_track_info(self, track, track_index):
        """Get comprehensive track information"""
        try:
            # Basic track info
            track_info = {
                'index': track_index,
                'name': str(track.name),
                'color': int(track.color) if hasattr(track, 'color') else 0,
                'is_foldable': bool(track.is_foldable) if hasattr(track, 'is_foldable') else False,
                'is_grouped': bool(track.is_grouped) if hasattr(track, 'is_grouped') else False
            }
            
            # Mixer device info
            if hasattr(track, 'mixer_device') and track.mixer_device:
                mixer = track.mixer_device
                track_info['mixer_device'] = {
                    'volume': float(mixer.volume.value),
                    'panning': float(mixer.panning.value) if hasattr(mixer, 'panning') else 0.0,
                    'sends': [float(send.value) for send in mixer.sends] if hasattr(mixer, 'sends') else []
                }
            
            # Track state
            track_info['track_state'] = {
                'mute': bool(track.mute),
                'solo': bool(track.solo),
                'arm': bool(track.arm) if hasattr(track, 'arm') else False,
                'current_monitoring_state': int(track.current_monitoring_state) if hasattr(track, 'current_monitoring_state') else 0
            }
            
            # Devices on track
            track_info['devices'] = []
            for device_idx, device in enumerate(track.devices):
                device_info = self._get_device_info(device, device_idx)
                track_info['devices'].append(device_info)
            
            // Clip slots info (session view)
            if hasattr(track, 'clip_slots'):
                track_info['clip_slots'] = []
                for slot_idx, slot in enumerate(track.clip_slots[:8]):  // First 8 slots
                    slot_info = {
                        'index': slot_idx,
                        'has_clip': bool(slot.has_clip),
                        'is_playing': bool(slot.is_playing) if hasattr(slot, 'is_playing') else False,
                        'is_triggered': bool(slot.is_triggered) if hasattr(slot, 'is_triggered') else False
                    }
                    
                    if slot.has_clip and slot.clip:
                        clip = slot.clip
                        slot_info['clip'] = {
                            'name': str(clip.name),
                            'length': float(clip.length),
                            'loop_start': float(clip.loop_start) if hasattr(clip, 'loop_start') else 0.0,
                            'loop_end': float(clip.loop_end) if hasattr(clip, 'loop_end') else 0.0,
                            'is_midi_clip': bool(clip.is_midi_clip) if hasattr(clip, 'is_midi_clip') else False
                        }
                    
                    track_info['clip_slots'].append(slot_info)
            
            return track_info
            
        except Exception as e:
            return {'name': str(track.name), 'error': str(e)}
    
    def take_snapshot(self):
        """Take comprehensive project snapshot"""
        try:
            // Project-level information
            project_info = {
                'name': self._get_project_name(),
                'tempo': float(self._song.tempo),
                'time_signature_numerator': int(self._song.signature_numerator),
                'time_signature_denominator': int(self._song.signature_denominator),
                'swing_amount': float(self._song.swing_amount),
                'current_song_time': float(self._song.current_song_time),
                'song_length': float(self._song.song_length),
                'loop_start': float(self._song.loop_start),
                'loop_end': float(self._song.loop_length),
                'is_playing': bool(self._song.is_playing),
                'is_recording': bool(self._song.record_mode),
                'metronome': bool(self._song.metronome),
                'track_count': len(self._song.tracks),
                'return_track_count': len(self._song.return_tracks) if hasattr(self._song, 'return_tracks') else 0
            }
            
            // Current focus
            current_focus = {
                'selected_track_index': -1,
                'selected_track': 'None'
            }
            
            if self._song.view.selected_track:
                selected_track = self._song.view.selected_track
                current_focus['selected_track'] = str(selected_track.name)
                
                // Find track index
                for i, track in enumerate(list(self._song.tracks) + list(self._song.return_tracks) + [self._song.master_track]):
                    if track == selected_track:
                        current_focus['selected_track_index'] = i
                        break
            
            // All tracks analysis
            tracks = []
            for i, track in enumerate(self._song.tracks):
                track_info = self._get_track_info(track, i)
                tracks.append(track_info)
            
            // Return tracks analysis
            return_tracks = []
            if hasattr(self._song, 'return_tracks'):
                for i, return_track in enumerate(self._song.return_tracks):
                    return_info = self._get_track_info(return_track, i)
                    return_tracks.append(return_info)
            
            // Master track analysis
            master_track = None
            if hasattr(self._song, 'master_track'):
                master_track = self._get_track_info(self._song.master_track, -1)
            
            // Complete snapshot
            snapshot = {
                'type': 'koennector_ultimate_snapshot',
                'project_info': project_info,
                'current_focus': current_focus,
                'tracks': tracks,
                'return_tracks': return_tracks,
                'master_track': master_track,
                'snapshot_timestamp': time.time()
            }
            
            // Send to Base44
            self._send_to_base44(snapshot)
            
        except Exception as e:
            self.log_message(f'Ultimate snapshot error: {e}')
    
    def apply_parameter_changes(self, changes):
        """Apply parameter modifications from AI"""
        try:
            for change in changes:
                change_type = change.get('type')
                
                if change_type == 'track_volume':
                    track_index = change.get('track_index')
                    new_value = change.get('new_value')
                    if track_index < len(self._song.tracks):
                        track = self._song.tracks[track_index]
                        track.mixer_device.volume.value = float(new_value)
                        
                elif change_type == 'track_mute':
                    track_index = change.get('track_index')
                    new_value = change.get('new_value')
                    if track_index < len(self._song.tracks):
                        track = self._song.tracks[track_index]
                        track.mute = bool(new_value)
                        
                elif change_type == 'track_solo':
                    track_index = change.get('track_index')
                    new_value = change.get('new_value')
                    if track_index < len(self._song.tracks):
                        track = self._song.tracks[track_index]
                        track.solo = bool(new_value)
                        
                elif change_type == 'track_name':
                    track_index = change.get('track_index')
                    new_value = change.get('new_value')
                    if track_index < len(self._song.tracks):
                        track = self._song.tracks[track_index]
                        track.name = str(new_value)
                        
                elif change_type == 'track_color':
                    track_index = change.get('track_index')
                    new_value = change.get('new_value')
                    if track_index < len(self._song.tracks) and hasattr(self._song.tracks[track_index], 'color'):
                        track = self._song.tracks[track_index]
                        track.color = int(new_value)
                        
                elif change_type == 'device_parameter':
                    track_index = change.get('track_index')
                    device_index = change.get('device_index')
                    param_index = change.get('param_index')
                    new_value = change.get('new_value')
                    
                    if track_index < len(self._song.tracks):
                        track = self._song.tracks[track_index]
                        if device_index < len(track.devices):
                            device = track.devices[device_index]
                            if param_index < len(device.parameters):
                                param = device.parameters[param_index]
                                if hasattr(param, 'value'):
                                    param.value = float(new_value)
                
                elif change_type == 'select_track':
                    track_index = change.get('track_index')
                    if track_index < len(self._song.tracks):
                        track = self._song.tracks[track_index]
                        self._song.view.selected_track = track
            
            // Take new snapshot after changes
            self.schedule_message(1, self.take_snapshot)
            
        except Exception as e:
            self.log_message(f'Parameter change error: {e}')
    
    def receive_ai_commands(self, commands):
        """Handle commands from AI copilot"""
        try:
            for command in commands:
                command_type = command.get('type')
                
                if command_type == 'take_snapshot':
                    self.take_snapshot()
                    
                elif command_type == 'apply_changes':
                    changes = command.get('changes', [])
                    self.apply_parameter_changes(changes)
                    
                elif command_type == 'select_track':
                    track_index = command.get('track_index')
                    if track_index < len(self._song.tracks):
                        self._song.view.selected_track = self._song.tracks[track_index]
                        
                elif command_type == 'start_playback':
                    self._song.start_playing()
                    
                elif command_type == 'stop_playback':
                    self._song.stop_playing()
                    
        except Exception as e:
            self.log_message(f'AI command error: {e}')
    
    def disconnect(self):
        """Clean up on disconnect"""
        try:
            // Remove listeners
            if self._song.view.selected_track_has_listener(self._on_track_selected):
                self._song.view.remove_selected_track_listener(self._on_track_selected)
            
            if self._song.is_playing_has_listener(self._on_transport_change):
                self._song.remove_is_playing_listener(self._on_transport_change)
                
            if self._song.current_song_time_has_listener(self._on_song_time_change):
                self._song.remove_current_song_time_listener(self._on_song_time_change)
                
            if self._song.tracks_has_listener(self._on_tracks_change):
                self._song.remove_tracks_listener(self._on_tracks_change)
                
        except Exception as e:
            self.log_message(f'Disconnect error: {e}')
        
        ControlSurface.disconnect(self)
        self.log_message('KOENNECTOR Ultimate: Disconnected from KOE LAB BRO')`;

            // Create downloads using data URLs
            const downloadFile = (filename, content) => {
                const element = document.createElement('a');
                element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
                element.setAttribute('download', filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            };

            // Download both files
            downloadFile('__init__.py', initPyContent);
            setTimeout(() => downloadFile('KOE.py', koePyContent), 500);

            // Show installation instructions
            showInstallInstructions(connectionCode, platform);

        } catch (error) {
            console.error('Download failed:', error);
            alert(`Failed to download KOENNECTOR Ultimate: ${error.message}`);
        } finally {
            setIsDownloading(false);
        }
    };

    const showInstallInstructions = (userCode, platform) => {
        const macPath = '~/Music/Ableton/User Library/Remote Scripts/KOE/';
        const windowsPath = 'C:/Users/[USERNAME]/AppData/Roaming/Ableton/Live [VERSION]/Preferences/User Library/Remote Scripts/KOE/';
        
        const folderPath = platform === 'mac' ? macPath : windowsPath;
        
        alert(`KOENNECTOR Ultimate Downloaded! 🎉

Your connection code: ${userCode}

Installation Steps:
1. Create a new folder named 'KOE' in your Ableton Remote Scripts directory:
   ${folderPath}
2. Move both downloaded files (__init__.py and KOE.py) into this new 'KOE' folder.
3. Open Ableton Live → Preferences (Ctrl+, or Cmd+,) → Link/Tempo/MIDI tab.
4. Under "Control Surface", select "KOE" from the dropdown menu.
5. Restart Ableton Live.
6. Done! KOE LAB BRO will now receive your project data.

If you have trouble finding the path or installing, please contact TMA Engine OS team for support!`);
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 relative z-10"
        >
            <Card className="glass-card rounded-2xl overflow-hidden shadow-2xl">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/5 pointer-events-none" />
                
                <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl glass-card-blue flex items-center justify-center">
                                <Settings className="w-7 h-7 text-blue-300" />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-light text-white tracking-tight flex items-center gap-3">
                                    🎛️ KOE LAB BRO
                                </CardTitle>
                                <p className="text-blue-300 text-lg mt-1 font-light">Your AI copilot that knows what you're working on</p>
                            </div>
                        </div>
                        
                        {/* Connection Status */}
                        <div className="flex items-center gap-3">
                            {connectionStatus === 'connected' ? (
                                <Badge className="glass-card-blue border-green-500/30 text-green-300 px-4 py-2 text-sm font-medium">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2" />
                                    LAB BRO Connected
                                </Badge>
                            ) : (
                                <Badge className="glass-card border-red-500/30 text-red-300 px-4 py-2 text-sm font-medium">
                                    <div className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                                    LAB BRO Offline
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-8 pt-4">
                    {/* Current Project Info */}
                    {connectionStatus === 'connected' && currentProject && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card rounded-xl p-6 border border-green-500/20"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Monitor className="w-6 h-6 text-green-400" />
                                <h4 className="text-green-300 font-semibold text-lg">Live Project Status</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <div className="text-gray-400 text-sm mb-1">Project</div>
                                    <div className="text-white font-medium text-lg">{currentProject.name}</div>
                                </div>
                                {currentProject.data?.tempo && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Tempo</div>
                                        <div className="text-white font-medium text-lg">{currentProject.data.tempo} BPM</div>
                                    </div>
                                )}
                                {currentProject.data?.current_track && (
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Focus Track</div>
                                        <div className="text-white font-medium text-lg">{currentProject.data.current_track}</div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Setup Instructions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Download Section */}
                        <div className="glass-card rounded-xl p-6 space-y-4">
                            <h4 className="text-white font-semibold text-xl flex items-center gap-3">
                                <Download className="w-5 h-5 text-blue-400" />
                                Get KOENNECTOR Ultimate
                            </h4>
                            <p className="text-gray-300 leading-relaxed">
                                Download 2 Python files ready to copy into your Ableton folder - no zip extraction needed!
                            </p>
                            
                            {labSession?.connection_token && (
                                <div className="glass-card-blue rounded-lg p-4 border border-blue-500/20 mb-4">
                                    <div className="text-xs text-blue-300 mb-2 uppercase tracking-wide">Your Connection Code:</div>
                                    <div className="text-blue-200 font-mono text-lg font-semibold">{labSession.connection_token}</div>
                                </div>
                            )}
                            
                            <div className="space-y-3">
                                {/* Mac Download Button */}
                                <Button
                                    onClick={() => handleDownloadKoennector('mac')}
                                    disabled={isDownloading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold border-0 py-3 text-base rounded-xl transition-all duration-300"
                                >
                                    {isDownloading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Preparing Files...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            📱 Download for Mac
                                        </>
                                    )}
                                </Button>
                                
                                {/* Windows Download Button */}
                                <Button
                                    onClick={() => handleDownloadKoennector('windows')}
                                    disabled={isDownloading}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold border-0 py-3 text-base rounded-xl transition-all duration-300"
                                >
                                    {isDownloading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Preparing Files...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            🖥️ Download for Windows
                                        </>
                                    )}
                                </Button>
                            </div>
                            
                            <p className="text-xs text-gray-400 text-center">
                                ✨ Downloads 2 files (__init__.py & KOE.py) with your connection code pre-configured!
                            </p>
                        </div>

                        {/* Setup Steps */}
                        <div className="glass-card rounded-xl p-6 space-y-4">
                            <h4 className="text-white font-semibold text-xl flex items-center gap-3">
                                <Zap className="w-5 h-5 text-blue-400" />
                                Connect Your LAB BRO in 3 Steps
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full glass-card-blue border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-blue-300 text-sm font-bold">1</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium mb-1">Unpack me</div>
                                        <div className="text-gray-400 text-sm">Create a 'KOE' folder & move files into your Ableton Remote Scripts directory (see alert for path)</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full glass-card-blue border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-blue-300 text-sm font-bold">2</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium mb-1">Koennect me up.. 🫦</div>
                                        <div className="text-gray-400 text-sm">In Ableton preferences, select "KOE" as a Control Surface</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full glass-card-blue border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-blue-300 text-sm font-bold">3</span>
                                    </div>
                                    <div>
                                        <div className="text-white font-medium mb-1">Let's create some magic on Ableton</div>
                                        <div className="text-gray-400 text-sm">Restart Ableton Live & chat with KOE!</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="glass-card rounded-xl p-6 border-t border-blue-500/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3 text-blue-200">
                                <div className="w-10 h-10 rounded-full glass-card-blue flex items-center justify-center">
                                    <Music2 className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="font-medium">Live Project Awareness</span>
                            </div>
                            <div className="flex items-center gap-3 text-blue-200">
                                <div className="w-10 h-10 rounded-full glass-card-blue flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="font-medium">Context-Aware Responses</span>
                            </div>
                            <div className="flex items-center gap-3 text-blue-200">
                                <div className="w-10 h-10 rounded-full glass-card-blue flex items-center justify-center">
                                    <Wifi className="w-5 h-5 text-green-400" />
                                </div>
                                <span className="font-medium">Real-Time Updates</span>
                            </div>
                            <div className="flex items-center gap-3 text-blue-200">
                                <div className="w-10 h-10 rounded-full glass-card-blue flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="font-medium">Seamless Integration</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.section>
    );
}
