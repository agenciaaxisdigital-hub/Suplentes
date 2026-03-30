// Processa a fila offline quando a conexão retorna
import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnlineStatus } from "./useOnlineStatus";
import { getQueue, dequeue, queueLength } from "@/lib/offlineQueue";
import { toast } from "@/hooks/use-toast";

export function useOfflineSync() {
  const qc = useQueryClient();
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(() => queueLength());

  const syncQueue = useCallback(async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const op of queue) {
      try {
        let error: unknown = null;

        if (op.operation === "insert") {
          ({ error } = await supabase.from(op.table as "suplentes").insert(op.data as never));
        } else if (op.operation === "update" && op.filter) {
          ({ error } = await supabase
            .from(op.table as "suplentes")
            .update(op.data as never)
            .eq(op.filter.column, op.filter.value));
        } else if (op.operation === "delete" && op.filter) {
          ({ error } = await supabase
            .from(op.table as "suplentes")
            .delete()
            .eq(op.filter.column, op.filter.value));
        }

        if (error) {
          errorCount++;
        } else {
          dequeue(op.id);
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    setSyncing(false);
    setPendingCount(queueLength());

    // Recarrega dados do servidor
    qc.invalidateQueries({ queryKey: ["suplentes"] });
    qc.invalidateQueries({ queryKey: ["pagamentos"] });

    if (successCount > 0) {
      toast({
        title: `✅ ${successCount} operação(ões) sincronizada(s)!`,
        description: errorCount > 0 ? `${errorCount} falharam e serão tentadas novamente.` : "Dados atualizados com sucesso.",
      });
    }
  }, [qc]);

  // Dispara sync automático quando voltar a conexão
  useEffect(() => {
    if (isOnline && queueLength() > 0) {
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  // Atualiza contador quando muda
  useEffect(() => {
    setPendingCount(queueLength());
  }, [isOnline]);

  return { syncing, pendingCount, syncQueue };
}
