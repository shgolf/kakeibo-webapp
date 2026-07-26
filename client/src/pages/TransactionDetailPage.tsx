import {Button} from "@/components/ui/button.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {Expense} from "@/types/expense.ts";
import {formatDate, formatDateTime, formatYen} from "@/lib/format.ts";
import {api} from "@/lib/api.ts";
import {CATEGORY_LABELS, PAYMENT_TYPE_LABELS} from "@/lib/labels.ts";

export default function TransactionDetailPage() {

    const [expense, setExpense] = useState<Expense>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const {id} = useParams();

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        (async () => {
            try {
                const data = await api.getExpense(id);
                if (!cancelled) setExpense(data);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "取得に失敗しました");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) return <p className="text-sm text-muted-foreground">読み込み中…</p>;
    if (error) return <p className="text-sm text-destructive">{error}</p>;
    if (!expense) return null;

    return (
        <div>
            <div className="flex items-center mb-2">
                <Button
                    variant="ghost"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ← 一覧に戻る
                </Button>
                <h1 className="ml-16">取引詳細</h1>
            </div>
            <div className="rounded-md border bg-card p-4">
                <p className="text-center text-xs text-muted-foreground">金額</p>
                <p className="text-center text-3xl font-medium">{formatYen(expense.amount)}</p>
                <hr className="my-3 border-border"/>

                <div className="flex justify-between gap-4 border-b py-2">
                    <span className="shrink-0 text-xs text-muted-foreground">タイトル</span>
                    <span className="min-w-0 text-right text-sm break-words">{expense.title}</span>
                </div>
                <div className="flex justify-between gap-4 border-b py-2">
                    <span className="shrink-0 text-xs text-muted-foreground">日付</span>
                    <span className="min-w-0 text-right text-sm">{formatDate(expense.date)}</span>
                </div>
                <div className="flex justify-between gap-4 border-b py-2">
                    <span className="shrink-0 text-xs text-muted-foreground">カテゴリ</span>
                    <span className="min-w-0 text-right text-sm">
                        {expense.category ? CATEGORY_LABELS[expense.category] : "—"}
                    </span>
                </div>
                <div className="flex justify-between gap-4 border-b py-2">
                    <span className="shrink-0 text-xs text-muted-foreground">支払方法</span>
                    <span className="min-w-0 text-right text-sm">
                        {PAYMENT_TYPE_LABELS[expense.paymentType]}
                    </span>
                </div>
                <div className="flex justify-between gap-4 border-b py-2">
                    <span className="shrink-0 text-xs text-muted-foreground">備考</span>
                    <span className="min-w-0 text-right text-sm break-words whitespace-pre-wrap">{expense.memo}</span>
                </div>
            </div>

            {/* TODO: 以下二つのボタンの遷移は未実装 */}
            <Button variant="outline" className="mt-3 w-full">編集する</Button>
            <Button variant="destructive" className="mt-2 w-full">削除する</Button>

            {expense.createdAt && (<p className="mt-3 text-center text-xs text-muted-foreground">
                    登録日時：{formatDateTime(expense.createdAt)}
                </p>
            )}
        </div>
    );
}