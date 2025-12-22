import Night from './pages/Night';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Night": Night,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Night",
    Pages: PAGES,
    Layout: __Layout,
};