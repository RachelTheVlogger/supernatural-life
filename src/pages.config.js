import Home from './pages/Home';
import Messages from './pages/Messages';
import Night from './pages/Night';
import OpeningScene from './pages/OpeningScene';
import ServantHome from './pages/ServantHome';
import VampireHome from './pages/VampireHome';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Messages": Messages,
    "Night": Night,
    "OpeningScene": OpeningScene,
    "ServantHome": ServantHome,
    "VampireHome": VampireHome,
}

export const pagesConfig = {
    mainPage: "Night",
    Pages: PAGES,
    Layout: __Layout,
};