import Codex from './pages/Codex';
import Home from './pages/Home';
import IncubusHome from './pages/IncubusHome';
import Index from './pages/Index';
import Messages from './pages/Messages';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import SuccubusHome from './pages/SuccubusHome';
import VampireHome from './pages/VampireHome';
import WitchHome from './pages/WitchHome';
import WerewolfHome from './pages/WerewolfHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Codex": Codex,
    "Home": Home,
    "IncubusHome": IncubusHome,
    "Index": Index,
    "Messages": Messages,
    "Night": Night,
    "ServantHome": ServantHome,
    "SuccubusHome": SuccubusHome,
    "VampireHome": VampireHome,
    "WitchHome": WitchHome,
    "WerewolfHome": WerewolfHome,
}

export const pagesConfig = {
    mainPage: "VampireHome",
    Pages: PAGES,
    Layout: __Layout,
};