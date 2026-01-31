/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminCleanup from './pages/AdminCleanup';
import AngelHome from './pages/AngelHome';
import Codex from './pages/Codex';
import DemonHome from './pages/DemonHome';
import DoppelgangerHome from './pages/DoppelgangerHome';
import GhostHome from './pages/GhostHome';
import Home from './pages/Home';
import HumanHome from './pages/HumanHome';
import HunterHome from './pages/HunterHome';
import IncubusHome from './pages/IncubusHome';
import Index from './pages/Index';
import Messages from './pages/Messages';
import NateLilithHome from './pages/NateLilithHome';
import NecromancerHome from './pages/NecromancerHome';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import ServantSnake from './pages/ServantSnake';
import ShapeshifterHome from './pages/ShapeshifterHome';
import SirenHome from './pages/SirenHome';
import StandaloneManga from './pages/StandaloneManga';
import SuccubusHome from './pages/SuccubusHome';
import VampireHome from './pages/VampireHome';
import WaterNymphHome from './pages/WaterNymphHome';
import WerewolfHome from './pages/WerewolfHome';
import WitchHome from './pages/WitchHome';
import YandereCoupleHome from './pages/YandereCoupleHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminCleanup": AdminCleanup,
    "AngelHome": AngelHome,
    "Codex": Codex,
    "DemonHome": DemonHome,
    "DoppelgangerHome": DoppelgangerHome,
    "GhostHome": GhostHome,
    "Home": Home,
    "HumanHome": HumanHome,
    "HunterHome": HunterHome,
    "IncubusHome": IncubusHome,
    "Index": Index,
    "Messages": Messages,
    "NateLilithHome": NateLilithHome,
    "NecromancerHome": NecromancerHome,
    "Night": Night,
    "ServantHome": ServantHome,
    "ServantSnake": ServantSnake,
    "ShapeshifterHome": ShapeshifterHome,
    "SirenHome": SirenHome,
    "StandaloneManga": StandaloneManga,
    "SuccubusHome": SuccubusHome,
    "VampireHome": VampireHome,
    "WaterNymphHome": WaterNymphHome,
    "WerewolfHome": WerewolfHome,
    "WitchHome": WitchHome,
    "YandereCoupleHome": YandereCoupleHome,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};