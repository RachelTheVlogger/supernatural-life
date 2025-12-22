import Garden from './pages/Garden';
import StyleComparison from './pages/StyleComparison';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Garden": Garden,
    "StyleComparison": StyleComparison,
}

export const pagesConfig = {
    mainPage: "Garden",
    Pages: PAGES,
    Layout: __Layout,
};