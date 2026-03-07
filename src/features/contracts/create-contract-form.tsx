"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createContractSchema, type CreateContractInput } from "@/lib/validations/contract";

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

  const {
    register,
    handleSubmit,
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

  async function onSubmit(data: CreateContractInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to create contract");

      toast.success("Contract created! The freelancer will be notified.");
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
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl p-6">
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
              Contract Amount (USD)
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
              rows={5}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
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
