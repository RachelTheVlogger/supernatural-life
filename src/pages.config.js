import Home from './pages/Home';
import Messages from './pages/Messages';
import Night from './pages/Night';
import ServantHome from './pages/ServantHome';
import VampireHome from './pages/VampireHome';
import OpeningScene from './pages/OpeningScene';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Messages": Messages,
    "Night": Night,
    "ServantHome": ServantHome,
    "VampireHome": VampireHome,
    "OpeningScene": OpeningScene,
}

export const pagesConfig = {
    mainPage: "Night",
    Pages: PAGES,
    Layout: __Layout,
};