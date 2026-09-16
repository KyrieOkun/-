"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { apiFetch } from "@/lib/client";
import { useI18n } from "@/lib/i18n/provider";
import { formatCNY } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/primitives";

/**
 * Deposit payment step. Opens the (simulated) hosted checkout and refreshes the
 * order once the provider confirms; wire the real PSP SDK here.
 */
export function OrderPayment({ orderId, method, amount }: { orderId: string; method: "wechat" | "alipay" | "card"; amount: number }) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    const res = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}/pay`, { method: "POST" });
    setLoading(false);
    if (!res.ok) return setError(t.common.error);
    router.refresh();
  }

  return (
    <div className="mt-5">
      <Button onClick={pay} loading={loading} fullWidth size="lg" icon={<Lock className="size-4" />}>
        {loading ? t.order.paying : `${t.order.payDeposit} ${formatCNY(amount)} · ${t.order[method]}`}
      </Button>
      <FieldError>{error}</FieldError>
    </div>
  );
}
