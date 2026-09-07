import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Trash2, Receipt, Bell } from "lucide-react";
import { thumb } from "@/lib/image";

type Item = {
  kind: "property" | "dormitory" | "shared";
  data: any;
  images: string[];
};

const KIND_LABEL: Record<Item["kind"], string> = {
  property: "طلب إضافة عقار",
  dormitory: "طلب إضافة داخلية",
  shared: "طلب إضافة شاغر",
};

export default function AdminNotifications({
  items,
  onApprove,
  onReject,
}: {
  items: Item[];
  onApprove: (kind: Item["kind"], id: string) => void;
  onReject: (kind: Item["kind"], id: string) => void;
}) {
  const [zoom, setZoom] = useState<string | null>(null);

  const sorted = [...items].sort(
    (a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p>لا توجد طلبات جديدة بانتظار المراجعة</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sorted.map(({ kind, data, images }) => (
        <Card key={`${kind}-${data.id}`} className="border-warning/40">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{KIND_LABEL[kind]}</Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(data.created_at).toLocaleString("ar-EG")}
                </span>
              </div>
              {kind === "property" && (
                <Badge variant={data.payment_receipt_url ? "default" : "destructive"}>
                  {data.payment_receipt_url ? "إشعار دفع مرفق" : "بدون إشعار دفع"}
                </Badge>
              )}
            </div>

            <div>
              <p className="font-bold">{data.title}</p>
              <p className="text-sm text-muted-foreground">
                {data.location} • {Number(data.price || 0).toLocaleString()} {data.currency || "ج.س"}
                {data.phone_number ? ` • ${data.phone_number}` : ""}
              </p>
              {data.description && <p className="text-sm mt-1 line-clamp-2">{data.description}</p>}
            </div>

            {(images.length > 0 || data.video_url) && (
              <div className="flex gap-3 overflow-x-auto">
                {images.slice(0, 6).map((u, i) => (
                  <img
                    key={i}
                    src={thumb(u, { width: 256, quality: 65 })}
                    alt={data.title}
                    loading="lazy"
                    decoding="async"
                    onClick={() => setZoom(u)}
                    className="h-24 w-32 object-cover rounded-md flex-shrink-0 cursor-zoom-in"
                  />
                ))}
                {data.video_url && (
                  <video src={data.video_url} controls className="h-24 w-32 object-cover rounded-md flex-shrink-0" />
                )}
              </div>
            )}

            {data.payment_receipt_url && (
              <div className="rounded-lg border p-3 bg-muted/40">
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Receipt className="h-4 w-4" /> صورة إشعار الدفع
                </p>
                <img
                  src={thumb(data.payment_receipt_url, { width: 320, quality: 70 })}
                  alt="إشعار الدفع"
                  loading="lazy"
                  onClick={() => setZoom(data.payment_receipt_url)}
                  className="h-40 rounded-md object-contain cursor-zoom-in bg-background"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onApprove(kind, data.id)}>
                <Check className="h-4 w-4 ml-1" /> موافقة ونشر
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onReject(kind, data.id)}>
                <Trash2 className="h-4 w-4 ml-1" /> رفض
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>معاينة الصورة</DialogTitle>
          </DialogHeader>
          {zoom && <img src={zoom} alt="معاينة" className="w-full rounded-md object-contain max-h-[70vh]" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
