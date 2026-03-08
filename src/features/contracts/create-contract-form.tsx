"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { X, FileText, Plus, Trash2, GripVertical, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createContractSchema, type CreateContractInput, type MilestoneInput } from "@/lib/validations/contract";
import { formatCurrency } from "@/lib/utils";
import { track, EVENTS } from "@/lib/analytics";

interface CreateContractFormProps {
  jobId: string;
  freelancerProfileId: string;
  suggestedAmount: number;
  freelancerName: string;
  onClose: () => void;
}

export function CreateContractForm({
  jobId,
  freelancerProfileId,
  suggestedAmount,
  freelancerName,
  onClose,
}: CreateContractFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);
  const [showMilestones, setShowMilestones] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateContractInput>({
    resolver: zodResolver(createContractSchema) as any,
    defaultValues: {
      jobId,
      freelancerProfileId,
      amount: suggestedAmount,
      description: "",
    },
  });

  const totalAmount = watch("amount");
  const milestoneTotal = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const milestoneDiff = (Number(totalAmount) || 0) - milestoneTotal;

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { title: "", description: "", amount: 0, dueDate: "" },
    ]);
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMilestone(index: number, field: keyof MilestoneInput, value: string | number) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  async function onSubmit(data: CreateContractInput) {
    if (showMilestones && milestones.length > 0) {
      // Validate milestones
      const invalidMilestone = milestones.find((m) => !m.title.trim() || !m.amount || m.amount < 1);
      if (invalidMilestone) {
        toast.error("Each milestone needs a title and amount of at least $1");
        return;
      }
      if (Math.abs(milestoneDiff) > 0.01) {
        toast.error("Milestone amounts must add up to the total contract amount");
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        ...(showMilestones && milestones.length > 0 && {
          milestones: milestones.map((m) => ({
            ...m,
            amount: Number(m.amount),
            dueDate: m.dueDate || undefined,
          })),
        }),
      };

      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create contract");

      toast.success("Contract created! The freelancer will be notified.");
      track(EVENTS.CONTRACT_CREATED, { amount: data.amount, has_milestones: showMilestones && milestones.length > 0, milestones_count: milestones.length });
      onClose();
      router.push(`/dashboard/contracts/${json.data.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create contract");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100">
              <FileText className="h-4 w-4 text-brand-800" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Contract</h2>
              <p className="text-xs text-gray-500">with {freelancerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("jobId")} />
          <input type="hidden" {...register("freelancerProfileId")} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Total Contract Amount (USD)
            </label>
            <Input
              type="number"
              min={1}
              step="0.01"
              {...register("amount")}
              placeholder="Enter amount"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description / Scope of Work
            </label>
            <Textarea
              {...register("description")}
              placeholder="Describe what work will be done, deliverables, and any terms..."
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Milestones toggle */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-600" />
                <span className="text-sm font-medium text-gray-700">Milestones</span>
              </div>
              {!showMilestones ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowMilestones(true);
                    if (milestones.length === 0) addMilestone();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Milestones
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowMilestones(false);
                    setMilestones([]);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Remove all
                </button>
              )}
            </div>

            {!showMilestones && (
              <p className="text-xs text-gray-400 mt-1">
                Break the contract into payment milestones for better tracking.
              </p>
            )}

            {showMilestones && (
              <div className="mt-3 space-y-3">
                {milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-300" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Milestone {index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="rounded-lg p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Input
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, "title", e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Amount (USD)</label>
                        <Input
                          type="number"
                          min={1}
                          step="0.01"
                          placeholder="0.00"
                          value={milestone.amount || ""}
                          onChange={(e) => updateMilestone(index, "amount", Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Due date (optional)</label>
                        <Input
                          type="date"
                          value={milestone.dueDate || ""}
                          onChange={(e) => updateMilestone(index, "dueDate", e.target.value)}
                        />
                      </div>
                    </div>

                    <Textarea
                      placeholder="Describe deliverables for this milestone... (optional)"
                      rows={2}
                      value={milestone.description}
                      onChange={(e) => updateMilestone(index, "description", e.target.value)}
                    />
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addMilestone}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Another Milestone
                </Button>

                {/* Milestone total summary */}
                <div className="rounded-lg bg-gray-100 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Milestone total</span>
                    <span className="font-medium text-gray-700">{formatCurrency(milestoneTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Contract total</span>
                    <span className="font-medium text-gray-700">{formatCurrency(Number(totalAmount) || 0)}</span>
                  </div>
                  {milestones.length > 0 && Math.abs(milestoneDiff) > 0.01 && (
                    <div className="flex justify-between text-xs font-medium text-red-600 pt-1 border-t border-gray-200">
                      <span>Difference</span>
                      <span>{milestoneDiff > 0 ? `${formatCurrency(milestoneDiff)} remaining` : `${formatCurrency(Math.abs(milestoneDiff))} over`}</span>
                    </div>
                  )}
                  {milestones.length > 0 && Math.abs(milestoneDiff) <= 0.01 && (
                    <div className="flex justify-between text-xs font-medium text-green-600 pt-1 border-t border-gray-200">
                      <span>Status</span>
                      <span>Amounts match</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={submitting} className="flex-1">
              Create Contract
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
