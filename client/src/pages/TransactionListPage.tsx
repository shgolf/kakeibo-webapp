import {useEffect, useState} from "react";
import type {Expense} from "@/types/expense.ts";
import {api} from "@/lib/api.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {formatDate, formatYen} from "@/lib/format.ts";
import {CATEGORY_LABELS, PAYMENT_TYPE_LABELS} from "@/lib/labels.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {Button} from "@/components/ui/button.tsx";
import {NavLink} from "react-router-dom";
import {Plus} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {currentMonth} from "@/lib/date.ts";

export default function TransactionListPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [month, setMonth] = useState<string>(currentMonth());
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const months = [...new Set([currentMonth(), ...expenses.map(
        (e) => e.date.slice(0, 7))]),].sort().reverse();

    const filtered = expenses.filter((e) => {
        const monthOk = month === "all" || e.date.startsWith(month);
        const categoryOk = categoryFilter === "all" ||
            (categoryFilter === "none" ? e.category === null : e.category === categoryFilter);
        return monthOk && categoryOk;
    })

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await api.listExpenses();
                if (!cancelled) setExpenses(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "取得に失敗しました");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <p className="text-sm text-muted-foreground">読み込み中…</p>;
    if (error) return <p className="text-sm text-destructive">{error}</p>;

    return (
        <div>
            <div className="flex gap-2 mb-3">
                <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="flex-1">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">すべての月</SelectItem>
                        {months.map((m) => (
                            <SelectItem key={m} value={m}>
                                {m.slice(0, 4)}年{Number(m.slice(5))}月
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="flex-1">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">すべて</SelectItem>
                        <SelectItem value="none">カテゴリなし</SelectItem>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex justify-between items-center rounded-md border bg-card px-4 py-2.5 mb-3">
                <span className="text-sm text-muted-foreground">合計支出</span>
                <span className="font-medium">{formatYen(total)}</span>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>日付・タイトル</TableHead>
                        <TableHead>カテゴリ</TableHead>
                        <TableHead className="text-right">金額</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filtered.map((e) => (
                        <TableRow key={e.id}>
                            <TableCell>
                                <div>{e.title}</div>
                                <div className="text-xs text-muted-foreground">
                                    {formatDate(e.date)}・{PAYMENT_TYPE_LABELS[e.paymentType]}
                                </div>
                            </TableCell>
                            <TableCell>
                                {e.category && <Badge variant="outline">{CATEGORY_LABELS[e.category]}</Badge>}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {formatYen(e.amount)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {filtered.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                    {expenses.length === 0 ? "まだ登録がありません" : "この条件の取引はありません"}
                </p>
            )}

            <Button asChild className="mt-3 w-full">
                <NavLink to="/new"><Plus/>新規登録</NavLink>
            </Button>
        </div>
    );
}