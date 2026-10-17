"use client";

import { useState } from "react";
import Link from "next/link";
import { formatSar } from "@/lib/format";
import { calculateZakat, type NisabBasis } from "@/lib/zakat";

function NumberField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        className="field"
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <p id={`${id}-hint`} className="hint">{hint}</p>}
    </div>
  );
}

export function ZakatForm() {
  const [cash, setCash] = useState("");
  const [goldGrams, setGoldGrams] = useState("");
  const [goldPrice, setGoldPrice] = useState("");
  const [silverGrams, setSilverGrams] = useState("");
  const [silverPrice, setSilverPrice] = useState("");
  const [tradeGoods, setTradeGoods] = useState("");
  const [receivables, setReceivables] = useState("");
  const [debts, setDebts] = useState("");
  const [basis, setBasis] = useState<NisabBasis>("silver");

  const num = (v: string) => (v === "" ? 0 : Number(v));
  const result = calculateZakat({
    cash: num(cash),
    goldGrams: num(goldGrams),
    goldPricePerGram: num(goldPrice),
    silverGrams: num(silverGrams),
    silverPricePerGram: num(silverPrice),
    tradeGoods: num(tradeGoods),
    receivables: num(receivables),
    debts: num(debts),
    nisabBasis: basis,
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <form className="card grid gap-5 p-5 md:p-8" onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="grid gap-4 md:grid-cols-2">
          <NumberField id="z-cash" label="النقد والأرصدة (ريال)" value={cash} onChange={setCash} />
          <NumberField id="z-trade" label="عروض التجارة (ريال)" value={tradeGoods} onChange={setTradeGoods} />
          <NumberField id="z-gold" label="الذهب (جرام)" value={goldGrams} onChange={setGoldGrams} />
          <NumberField id="z-gold-price" label="سعر جرام الذهب اليوم (ريال)" value={goldPrice} onChange={setGoldPrice} hint="أدخل السعر الحالي من مصدر موثوق." />
          <NumberField id="z-silver" label="الفضة (جرام)" value={silverGrams} onChange={setSilverGrams} />
          <NumberField id="z-silver-price" label="سعر جرام الفضة اليوم (ريال)" value={silverPrice} onChange={setSilverPrice} hint="أدخل السعر الحالي من مصدر موثوق." />
          <NumberField id="z-recv" label="ديون مرجوّة السداد لك (ريال)" value={receivables} onChange={setReceivables} />
          <NumberField id="z-debts" label="ديون حالّة عليك (ريال)" value={debts} onChange={setDebts} />
        </div>
        <div>
          <label htmlFor="z-basis" className="label">أساس حساب النصاب</label>
          <select id="z-basis" className="field" value={basis} onChange={(e) => setBasis(e.target.value as NisabBasis)}>
            <option value="silver">نصاب الفضة (595 جراماً)</option>
            <option value="gold">نصاب الذهب (85 جراماً)</option>
          </select>
        </div>
      </form>

      <aside className="card h-fit p-5 lg:sticky lg:top-24" aria-live="polite">
        <h2 className="text-lg font-bold">نتيجة الحساب</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-2"><dt className="text-ink-soft">إجمالي الأصول</dt><dd className="font-semibold">{formatSar(result.totalAssets)}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-ink-soft">صافي المال</dt><dd className="font-semibold">{formatSar(result.netWealth)}</dd></div>
          <div className="flex justify-between gap-2"><dt className="text-ink-soft">النصاب</dt><dd className="font-semibold">{result.missingPrice ? "—" : formatSar(result.nisab)}</dd></div>
        </dl>
        <div className="mt-4 rounded-xl bg-brand-soft p-4 text-center">
          <p className="text-sm text-ink-soft">الزكاة الواجبة (2.5%)</p>
          <p className="mt-1 text-3xl font-bold text-brand">{formatSar(result.zakatDue)}</p>
        </div>
        {result.missingPrice ? (
          <p className="alert alert-info mt-4">أدخل سعر جرام {basis === "gold" ? "الذهب" : "الفضة"} لتحديد النصاب.</p>
        ) : result.nisabMet ? (
          <p className="alert alert-ok mt-4">بلغ مالك النصاب، وتجب الزكاة إذا حال عليه الحول.</p>
        ) : (
          <p className="alert alert-info mt-4">لم يبلغ مالك النصاب، فلا زكاة عليك الآن.</p>
        )}
        <Link href="/donate" className="btn btn-primary mt-4 w-full">أخرج زكاتك الآن</Link>
        <p className="hint mt-3">الحاسبة للاسترشاد فقط، وللفتوى راجع أهل العلم.</p>
      </aside>
    </div>
  );
}
