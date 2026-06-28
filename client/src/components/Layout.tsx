import {NavLink, Outlet} from "react-router-dom";
import {Home, List, Wallet} from "lucide-react";
import {cn} from "@/lib/utils";

const navLink = ({isActive}: { isActive: boolean }) =>
    cn(
        "flex items-center gap-1 text-sm transition-colors",
        isActive
            ? "text-foreground font-medium"
            : "text-muted-foreground hover:text-foreground",
    );

export default function Layout() {
    return (
        // wireframe の 360px モバイル幅を踏襲（中央寄せ＋左右border）
        <div className="mx-auto min-h-screen max-w-md border-x">
            <header className="flex items-center justify-between border-b bg-card px-4 py-3">
                <span className="flex items-center gap-1.5 font-medium">
                    <Wallet className="size-4"/> 家計簿
                </span>
                <nav className="flex gap-4">
                    {/* end を付けると "/" 完全一致のときだけ active */}
                    <NavLink to="/" end className={navLink}>
                        <Home className="size-4"/> ホーム
                    </NavLink>
                    <NavLink to="/transactions" className={navLink}>
                        <List className="size-4"/> 一覧
                    </NavLink>
                </nav>
            </header>
            <main className="p-4">
                <Outlet/>
            </main>
        </div>
    );
}