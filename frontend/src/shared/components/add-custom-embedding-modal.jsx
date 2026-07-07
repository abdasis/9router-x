import { useState, useEffect } from "react";
import PropTypes from "prop-types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
} from "@/components/ui/field";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

// Renders validation status badge + error info
function ValidationResult({ result }) {
  if (!result) return null;
  const { valid, error, dimensions } = result;
  if (valid) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
        >
          Valid
        </Badge>
        {dimensions && (
          <span className="text-sm text-muted-foreground">{dimensions} dims</span>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <Badge variant="destructive">Invalid</Badge>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}

export default function AddCustomEmbeddingModal({ isOpen, onClose, onCreated, onSaved, node }) {
  const isEdit = !!node;
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    baseUrl: DEFAULT_BASE_URL,
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkKey, setCheckKey] = useState("");
  const [checkModelId, setCheckModelId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setValidationResult(null);
    setCheckKey("");
    setCheckModelId("");
    setFormData({
      name: node?.name || "",
      prefix: node?.prefix || "",
      baseUrl: node?.baseUrl || DEFAULT_BASE_URL,
    });
  }, [isOpen, node]);

  const updateField = (key) => (e) =>
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async () => {
    const { name, prefix, baseUrl } = formData;
    if (!name.trim() || !prefix.trim() || !baseUrl.trim()) return;
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/provider-nodes/${node.id}` : "/api/provider-nodes";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        name: name.trim(),
        prefix: prefix.trim(),
        baseUrl: baseUrl.trim(),
      };
      if (!isEdit) payload.type = "custom-embedding";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (isEdit) onSaved?.(data.node);
        else onCreated?.(data.node);
      }
    } catch (error) {
      console.log("Error saving custom embedding node:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/provider-nodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: formData.baseUrl,
          apiKey: checkKey,
          type: "custom-embedding",
          modelId: checkModelId.trim() || undefined,
        }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch {
      setValidationResult({ valid: false, error: "Network error" });
    } finally {
      setValidating(false);
    }
  };

  const canSubmit =
    formData.name.trim() && formData.prefix.trim() && formData.baseUrl.trim();
  const canValidate = checkKey && checkModelId.trim() && formData.baseUrl.trim();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Custom Embedding" : "Add Custom Embedding"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Name</FieldLabel>
            <FieldContent>
              <Input
                value={formData.name}
                onChange={updateField("name")}
                placeholder="Voyage AI"
              />
              <FieldDescription>
                Required. A friendly label for this embedding provider.
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Prefix</FieldLabel>
            <FieldContent>
              <Input
                value={formData.prefix}
                onChange={updateField("prefix")}
                placeholder="voyage"
              />
              <FieldDescription>
                Required. Used as the provider prefix for model IDs (e.g. voyage/voyage-3).
              </FieldDescription>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Base URL</FieldLabel>
            <FieldContent>
              <Input
                value={formData.baseUrl}
                onChange={updateField("baseUrl")}
                placeholder="https://api.voyageai.com/v1"
              />
              <FieldDescription>
                Most embedding APIs are OpenAI-compatible: Voyage, Cohere, Jina, Mistral, Together...
              </FieldDescription>
            </FieldContent>
          </Field>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-medium">Validation</h4>

          <Field>
            <FieldLabel>API Key (for Check)</FieldLabel>
            <FieldContent>
              <Input
                type="password"
                value={checkKey}
                onChange={(e) => setCheckKey(e.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Model ID (for Check)</FieldLabel>
            <FieldContent>
              <Input
                value={checkModelId}
                onChange={(e) => setCheckModelId(e.target.value)}
                placeholder="e.g. voyage-3, embed-english-v3.0, text-embedding-3-small"
              />
              <FieldDescription>
                Required. Will send a test embeddings request.
              </FieldDescription>
            </FieldContent>
          </Field>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleValidate}
              disabled={!canValidate || validating}
              variant="secondary"
            >
              {validating ? "Checking..." : "Check"}
            </Button>
            <ValidationResult result={validationResult} />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Save"
                : "Create"}
          </Button>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

AddCustomEmbeddingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
  onSaved: PropTypes.func,
  node: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    prefix: PropTypes.string,
    baseUrl: PropTypes.string,
  }),
};
