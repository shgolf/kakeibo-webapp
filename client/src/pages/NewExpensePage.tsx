import {type FormEvent, useState} from "react";
import {Field, FieldError, FieldLabel} from "@/components/ui/field.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import type {Category, PaymentType} from "@/types/expense.ts";
import {api, ApiError} from "@/lib/api.ts";
import {toISODate} from "@/lib/date.ts";

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

function RequiredMark() {
    return (
        <span className="ml-1 text-xs text-destructive" aria-hidden="true">
            *必須
        </span>
    );
}

export default function NewExpensePage() {
    const navigate = useNavigate()

    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(
        new Date("2026-07-01")
    )
    const [month, setMonth] = useState<Date | undefined>(date)
    const [value, setValue] = useState(formatDate(date))

    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("0")
    const [category, setCategory] = useState<Category | "">("")
    const [paymentType, setPaymentType] = useState<PaymentType | "">("")
    const [memo, setMemo] = useState("")

    const [error, setError] = useState<string | null>(null)
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const {id} = useParams();
    const isEdit = Boolean(id);

    const submitHandler = async (e: FormEvent) => {
        e.preventDefault();                       // ページリロードを防ぐ
        setError(null)
        setFieldErrors({})
        try {
            await api.createExpense({
                date: date ? toISODate(date) : null,            // Date → "2026-07-01"（下のヘルパー）
                title,
                amount: amount === "" ? null : Number(amount),           // string → number
                category: category === "" ? null : category,
                paymentType: paymentType === "" ? null : paymentType,
                memo: memo === "" ? null : memo,
            });
            navigate("/transactions");            // 成功 → 一覧へ
        } catch (err) {
            if (err instanceof ApiError) {
                setFieldErrors(err.fieldErrors);
            }
            setError(err instanceof Error ? err.message : "登録に失敗しました")
        }
    };


    return (
        <form onSubmit={submitHandler} className="flex flex-col">
            <div className="flex items-center mb-2">
                <Button
                    variant="ghost"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    ←キャンセル
                </Button>
                <h1 className="ml-16">新規登録</h1>
            </div>
            <Separator/>
            <Field className="mx-auto w-90 mt-5">
                <FieldLabel htmlFor="date-required">日付<RequiredMark/></FieldLabel>
                <InputGroup>
                    <InputGroupInput
                        id="date-required"
                        aria-required={true}
                        aria-invalid={!!fieldErrors?.date}
                        aria-describedby={fieldErrors?.date ? "date-error" : undefined}
                        value={value}
                        placeholder="July 01, 2026"
                        onChange={(e) => {
                            const date = new Date(e.target.value)
                            setValue(e.target.value)
                            if (isValidDate(date)) {
                                setDate(date)
                                setMonth(date)
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                                e.preventDefault()
                                setOpen(true)
                            }
                        }}
                    />
                    <InputGroupAddon align="inline-end">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <InputGroupButton
                                    id="date-picker"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label="Select date"
                                >
                                    <CalendarIcon/>
                                    <span className="sr-only">Select date</span>
                                </InputGroupButton>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={10}
                            >
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    month={month}
                                    onMonthChange={setMonth}
                                    onSelect={(date) => {
                                        setDate(date)
                                        setValue(formatDate(date))
                                        setOpen(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </InputGroupAddon>
                </InputGroup>
                <FieldError id="date-error">{fieldErrors?.date}</FieldError>
            </Field>
            <Field className="mx-auto w-90 mt-3">
                <FieldLabel htmlFor="input-field-title">タイトル<RequiredMark/></FieldLabel>
                <Input
                    id="input-field-title"
                    aria-required={true}
                    aria-invalid={!!fieldErrors?.title}
                    aria-describedby={fieldErrors?.title ? "title-error" : undefined}
                    type="text"
                    placeholder="例：スーパー、ランチ"
                    onChange={(e) => {
                        setTitle(e.target.value)
                    }}
                />
                <FieldError id="title-error">{fieldErrors?.title}</FieldError>
            </Field>
            <Field className="mx-auto w-90 mt-3">
                <FieldLabel htmlFor="input-field-amount">金額<RequiredMark/></FieldLabel>
                <Input
                    id="input-field-amount"
                    aria-required={true}
                    aria-invalid={!!fieldErrors?.amount}
                    aria-describedby={fieldErrors?.amount ? "amount-error" : undefined}
                    type="number"
                    placeholder="例：1500"
                    onChange={(e) => {
                        setAmount(e.target.value)
                    }}
                />
                <FieldError id="amount-error">{fieldErrors?.amount}</FieldError>
            </Field>
            <Field className="mx-auto w-90 mt-3">
                <FieldLabel htmlFor="input-field-category">カテゴリ</FieldLabel>
                <Select
                    value={category}
                    onValueChange={(value) => setCategory(value as Category)}
                >
                    <SelectTrigger className="w-full max-w-90">
                        <SelectValue placeholder="選択してください"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup id="input-field-category">
                            <SelectLabel>カテゴリ</SelectLabel>
                            <SelectItem value="FOOD">食費</SelectItem>
                            <SelectItem value="TRANSPORT">交通費</SelectItem>
                            <SelectItem value="CLOTHING">衣類</SelectItem>
                            <SelectItem value="OTHER">その他</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>
            <Field className="mx-auto w-90 mt-3">
                <FieldLabel htmlFor="input-field-payment-type">支払方法<RequiredMark/></FieldLabel>
                <ToggleGroup
                    variant="outline"
                    type="single"
                    aria-required={true}
                    aria-invalid={!!fieldErrors?.paymentType}
                    aria-describedby={fieldErrors?.paymentType ? "payment-type-error" : undefined}
                    value={paymentType}
                    id="input-field-payment-type"
                    className="flex w-full max-w-90 justify-between"
                    onValueChange={(value) => setPaymentType(value as PaymentType)}
                >
                    <ToggleGroupItem value="CASH" className="w-28">
                        現金
                    </ToggleGroupItem>
                    <ToggleGroupItem value="CREDIT" className="w-28">
                        クレジット
                    </ToggleGroupItem>
                    <ToggleGroupItem value="TRANSFER" className="w-28">
                        振込
                    </ToggleGroupItem>
                </ToggleGroup>
                <FieldError id="payment-type-error">{fieldErrors?.paymentType}</FieldError>
            </Field>
            <Field className="mx-auto w-90 mt-3">
                <FieldLabel htmlFor="input-field-memo">備考</FieldLabel>
                <Textarea
                    id="input-field-memo"
                    placeholder="メモがあれば入力してください"
                    onChange={(e) => {
                        setMemo(e.target.value)
                    }}
                />
            </Field>
            {error && (
                <p className="mx-auto w-90 mt-3 text-sm text-destructive whitespace-pre-line">
                    {error}
                </p>
            )}
            <Button
                type="submit"
                className="mx-auto w-90 mt-3"
            >
                登録する
            </Button>
            <Button
                variant="outline"
                type="button"
                className="mx-auto w-90 mt-3"
                onClick={() => navigate(-1)}
            >
                キャンセル
            </Button>
        </form>
    )
}