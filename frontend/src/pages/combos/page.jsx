import { useState } from "react";
import { Layers, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { useCombos } from "./hooks/use-combos";
import { ComboCard } from "./components/combo-card";
import { ComboFormModal } from "./components/combo-form-modal";

export default function CombosPage() {
  const {
    combos,
    loading,
    activeProviders,
    comboStrategies,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleRoundRobin,
  } = useCombos();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { copied, copy } = useCopyToClipboard();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Combos</h1>
          <p className="text-sm text-text-muted mt-1">
            Create model combos with fallback support
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
          <Plus />
          Create Combo
        </Button>
      </div>

      {combos.length === 0 ? (
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <Layers className="size-8" />
            </div>
            <p className="text-foreground font-medium mb-1">
              No combos yet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create model combos with fallback support
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus /> Create Combo
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {combos.map((combo) => (
            <ComboCard
              key={combo.id}
              combo={combo}
              copied={copied}
              onCopy={copy}
              onEdit={() => setEditingCombo(combo)}
              onDelete={() => setDeleteTarget(combo)}
              roundRobinEnabled={
                comboStrategies[combo.name]?.fallbackStrategy === "round-robin"
              }
              onToggleRoundRobin={(enabled) =>
                handleToggleRoundRobin(combo.name, enabled)
              }
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <ComboFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreate}
        activeProviders={activeProviders}
      />

      {/* Edit Modal */}
      {editingCombo && (
        <ComboFormModal
          key={editingCombo.id}
          isOpen={!!editingCombo}
          combo={editingCombo}
          onClose={() => setEditingCombo(null)}
          onSave={(data) => handleUpdate(editingCombo.id, data)}
          activeProviders={activeProviders}
        />
      )}

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Combo</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <code className="font-mono text-sm">{deleteTarget?.name}</code>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 px-4 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                handleDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
