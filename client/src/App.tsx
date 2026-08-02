import {Route, Routes} from "react-router-dom";
import Layout from "@/components/Layout.tsx";
import HomePage from "@/pages/HomePage.tsx";
import NewExpensePage from "@/pages/NewExpensePage.tsx";
import TransactionListPage from "./pages/TransactionListPage";
import TransactionDetailPage from "./pages/TransactionDetailPage";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path="/" element={<HomePage/>}></Route>
                <Route path="/new" element={<NewExpensePage/>}></Route>
                <Route path="/transactions" element={<TransactionListPage/>}></Route>
                <Route path="/transactions/:id" element={<TransactionDetailPage/>}></Route>
                <Route path="/transactions/:id/edit" element={<NewExpensePage/>}/>
            </Route>
        </Routes>
    )
}