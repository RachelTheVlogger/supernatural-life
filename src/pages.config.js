import Garden from './pages/Garden';
import StyleComparison from './pages/StyleComparison';
import Night from './pages/Night';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Garden": Garden,
    "StyleComparison": StyleComparison,
    "Night": Night,
}

export const pagesConfig = {
    mainPage: "Garden",
    Pages: PAGES,
    Layout: __Layout,
};