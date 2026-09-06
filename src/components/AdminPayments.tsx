import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Save, Receipt, Check, Trash2, Landmark } from "lucide-react";
import { thumb } from "@/lib/image";

type Settings = {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  listing_price: number;
  currency: string;
  instructions: string | null;
  payment_required: boolean;
};

type Props = {
  properties: any[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export default function AdminPayments({ properties, onApprove, onReject }: Props) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("payment_settings")
      .select("*")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setSettings(data as Settings | null));
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("payment_settings")
      .update({
        bank_name: settings.bank_name,
        account_number: settings.account_number,
        account_name: settings.account_name,
        listing_price: Number(settings.listing_price) || 0,
        currency: settings.currency,
        instructions: settings.instructions,
        payment_required: settings.payment_required,
      })
      .eq("id", settings.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("تم حفظ إعدادات الدفع");
  };

  const withReceipts = properties.filter((p) => p.payment_receipt_url);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" /> إعدادات الدفع
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">طريقة/اسم البنك</label>
                  <Input value={settings.bank_name} onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رقم الحساب</label>
                  <Input dir="ltr" value={settings.account_number} onChange={(e) => setSettings({ ...settings, account_number: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">اسم صاحب الحساب</label>
                  <Input value={settings.account_name} onChange={(e) => setSettings({ ...settings, account_name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">سعر نشر الإعلان</label>
                  <Input type="number" value={settings.listing_price} onChange={(e) => setSettings({ ...settings, listing_price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">العملة</label>
                  <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SDG">ج.س</SelectItem>
                      <SelectItem value="USD">دولار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تعليمات للمعلن</label>
                <Textarea rows={2} value={settings.instructions || ""} onChange={(e) => setSettings({ ...settings, instructions: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">اشتراط إرفاق إشعار الدفع</p>
                  <p className="text-xs text-muted-foreground">عند الإيقاف يمكن نشر الإعلان بدون دفع</p>
                </div>
                <Switch checked={settings.payment_required} onCheckedChange={(v) => setSettings({ ...settings, payment_required: v })} />
              </div>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                حفظ الإعدادات
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> إشعارات الدفع ({withReceipts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {withReceipts.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm">لا توجد إشعارات دفع بعد</p>
          )}
          {withReceipts.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
              <button type="button" onClick={() => setReceipt(p.payment_receipt_url)} className="shrink-0">
                <img
                  src={thumb(p.payment_receipt_url, { width: 160, quality: 65 })}
                  alt={`إشعار دفع ${p.title}`}
                  loading="lazy"
                  className="h-20 w-20 rounded-md object-cover border"
                />
              </button>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{p.title}</p>
                <p className="text-sm text-muted-foreground">
                  {p.price?.toLocaleString()} {p.currency === "USD" ? "دولار" : "ج.س"} • {p.location}
                </p>
                <Badge variant={p.status === "approved" ? "default" : "secondary"} className="mt-1">
                  {p.status === "approved" ? "مقبول" : p.status === "pending" ? "بانتظار المراجعة" : p.status}
                </Badge>
              </div>
              <div className="flex gap-2">
                {p.status !== "approved" && (
                  <Button size="sm" onClick={() => onApprove(p.id)}><Check className="h-4 w-4 ml-1" />قبول</Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => onReject(p.id)}>
                  <Trash2 className="h-4 w-4 ml-1" />رفض
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!receipt} onOpenChange={() => setReceipt(null)}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>إشعار الدفع</DialogTitle></DialogHeader>
          {receipt && <img src={thumb(receipt, { width: 900, quality: 85 })} alt="إشعار الدفع" className="w-full rounded-md" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
