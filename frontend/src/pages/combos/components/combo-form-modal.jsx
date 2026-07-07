import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModelSelectModal } from "@/shared/components";
import { ModelItem } from "./model-item";

const VALID_NAME_REGEX = /^[a-zA-Z0-9_.\-]+$/;

export function ComboFormModal({
  isOpen,
  combo,
  onClose,
  onSave,
  activeProviders,
  kindFilter = null,
}) {
  const [name, setName] = useState(combo?.name || "");
  const [models, setModels] = useState(combo?.models || []);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [modelAliases, setModelAliases] = useState({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const modelItems = models.map((model, i) => ({ uid: `item-${i}`, model }));

  useEffect(() => {
    if (isOpen) fetchModalData();
  }, [isOpen]);

  const fetchModalData = async () => {
    try {
      const res = await fetch("/api/models/alias");
      if (!res.ok) return;
      const data = await res.json();
      setModelAliases(data.aliases || {});
    } catch (error) {
      console.error("Error fetching modal data:", error);
    }
  };

  const validateName = (value) => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (!VALID_NAME_REGEX.test(value)) {
      setNameError("Only letters, numbers, -, _ and . allowed");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (value) validateName(value);
    else setNameError("");
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modelItems.findIndex((m) => m.uid === active.id);
      const newIndex = modelItems.findIndex((m) => m.uid === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setModels((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleAddModel = (model) => {
    if (!models.includes(model.value)) {
      setModels([...models, model.value]);
    }
  };

  const handleDeselectModel = (model) => {
    setModels(models.filter((m) => m !== model.value));
  };

  const handleRemoveModel = (index) => {
    setModels(models.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const next = [...models];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setModels(next);
  };

  const handleMoveDown = (index) => {
    if (index === models.length - 1) return;
    const next = [...models];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setModels(next);
  };

  const handleSave = async () => {
    if (!validateName(name)) return;
    setSaving(true);
    await onSave({ name: name.trim(), models });
    setSaving(false);
  };

  const isEdit = !!combo;

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Combo" : "Create Combo"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 px-4 pb-4">
            {/* Name */}
            <div>
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="my-combo"
                aria-invalid={!!nameError}
              />
              {nameError && (
                <p className="text-[10px] text-destructive mt-0.5">
                  {nameError}
                </p>
              )}
              <p className="text-[10px] text-text-muted mt-0.5">
                Only letters, numbers, -, _ and . allowed
              </p>
            </div>

            {/* Models */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Models
              </label>

              {models.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-black/10 dark:border-white/10 rounded-lg bg-black/[0.01] dark:bg-white/[0.01]">
                  <p className="text-xs text-text-muted">
                    No models added yet
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[
                    restrictToVerticalAxis,
                    restrictToParentElement,
                  ]}
                >
                  <SortableContext
                    items={modelItems.map((m) => m.uid)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex max-h-[55vh] min-w-0 flex-col gap-1 overflow-y-auto sm:max-h-[350px]">
                      {modelItems.map(({ uid, model }, index) => (
                        <ModelItem
                          key={uid}
                          id={uid}
                          index={index}
                          model={model}
                          isFirst={index === 0}
                          isLast={index === modelItems.length - 1}
                          onEdit={(newVal) => {
                            const updated = [...models];
                            updated[index] = newVal;
                            setModels(updated);
                          }}
                          onMoveUp={() => handleMoveUp(index)}
                          onMoveDown={() => handleMoveDown(index)}
                          onRemove={() => handleRemoveModel(index)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              <button
                onClick={() => setShowModelSelect(true)}
                className="w-full mt-2 py-2 border border-dashed border-black/10 dark:border-white/10 rounded-lg text-xs text-primary font-medium hover:text-primary/80 hover:border-primary/50 transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="size-4" />
                Add Model
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                onClick={onClose}
                variant="ghost"
                className="flex-1"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                size="sm"
                disabled={!name.trim() || !!nameError || saving}
              >
                {saving ? "Saving..." : isEdit ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ModelSelectModal
        isOpen={showModelSelect}
        onClose={() => setShowModelSelect(false)}
        onSelect={handleAddModel}
        onDeselect={handleDeselectModel}
        activeProviders={activeProviders}
        modelAliases={modelAliases}
        title="Add Model to Combo"
        kindFilter={kindFilter}
        addedModelValues={models}
        closeOnSelect={false}
      />
    </>
  );
}
