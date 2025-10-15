import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Upload from "./Upload";

import Analyses from "./Analyses";

import KOE from "./KOE";

import OrbUpload from "./OrbUpload";

// import analyses from "./analyses"; // This file doesn't exist - commenting out

import INDI from "./INDI";

import MixCompare from "./MixCompare";

import Onboarding from "./Onboarding";

import ArkChat from "./ArkChat";

import KoeSerenader from "./KoeSerenader";

import KoePreferences from "./KoePreferences";

import ArkShotlistBuilder from "./ArkShotlistBuilder";

import ArkOnboarding from "./ArkOnboarding";

import YourContentIdeas from "./YourContentIdeas";

import MyShotlists from "./MyShotlists";

import youtubetest from "./youtubetest";

import UploadArtistStyles from "./UploadArtistStyles";

import SerenaderTesting from "./SerenaderTesting";

import YourBrainDumps from "./YourBrainDumps";

import ArkDashboard from "./ArkDashboard";

import ManageAssistants from "./ManageAssistants";

import GlobalAISettings from "./GlobalAISettings";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Upload: Upload,
    
    Analyses: Analyses,
    
    KOE: KOE,
    
    OrbUpload: OrbUpload,
    
    // analyses: analyses, // Removed - file doesn't exist
    
    INDI: INDI,
    
    MixCompare: MixCompare,
    
    Onboarding: Onboarding,
    
    ArkChat: ArkChat,
    
    KoeSerenader: KoeSerenader,
    
    KoePreferences: KoePreferences,
    
    ArkShotlistBuilder: ArkShotlistBuilder,
    
    ArkOnboarding: ArkOnboarding,
    
    YourContentIdeas: YourContentIdeas,
    
    MyShotlists: MyShotlists,
    
    youtubetest: youtubetest,
    
    UploadArtistStyles: UploadArtistStyles,
    
    SerenaderTesting: SerenaderTesting,
    
    YourBrainDumps: YourBrainDumps,
    
    ArkDashboard: ArkDashboard,
    
    ManageAssistants: ManageAssistants,
    
    GlobalAISettings: GlobalAISettings,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Analyses" element={<Analyses />} />
                
                <Route path="/KOE" element={<KOE />} />
                
                <Route path="/OrbUpload" element={<OrbUpload />} />
                
                {/* <Route path="/analyses" element={<analyses />} /> */}
                
                <Route path="/INDI" element={<INDI />} />
                
                <Route path="/MixCompare" element={<MixCompare />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/ArkChat" element={<ArkChat />} />
                
                <Route path="/KoeSerenader" element={<KoeSerenader />} />
                
                <Route path="/KoePreferences" element={<KoePreferences />} />
                
                <Route path="/ArkShotlistBuilder" element={<ArkShotlistBuilder />} />
                
                <Route path="/ArkOnboarding" element={<ArkOnboarding />} />
                
                <Route path="/YourContentIdeas" element={<YourContentIdeas />} />
                
                <Route path="/MyShotlists" element={<MyShotlists />} />
                
                <Route path="/youtubetest" element={<youtubetest />} />
                
                <Route path="/UploadArtistStyles" element={<UploadArtistStyles />} />
                
                <Route path="/SerenaderTesting" element={<SerenaderTesting />} />
                
                <Route path="/YourBrainDumps" element={<YourBrainDumps />} />
                
                <Route path="/ArkDashboard" element={<ArkDashboard />} />
                
                <Route path="/ManageAssistants" element={<ManageAssistants />} />
                
                <Route path="/GlobalAISettings" element={<GlobalAISettings />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}