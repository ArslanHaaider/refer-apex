"use client";

import { MessageSquareText } from "lucide-react";
import type { DiscountType } from "@/lib/referrals/types";

type StepOfferProps = {
  name: string;
  onNameChange: (v: string) => void;
  messageTemplate: string;
  onMessageTemplateChange: (v: string) => void;
  emailSubject: string;
  onEmailSubjectChange: (v: string) => void;
  discountType: DiscountType;
  onDiscountTypeChange: (v: DiscountType) => void;
  discountValue: number;
  onDiscountValueChange: (v: number) => void;
  discountDescription: string;
  onDiscountDescriptionChange: (v: string) => void;
};

function renderPreview(template: string, discountLabel: string, discountDescription: string) {
  return template
    .replaceAll("{{first_name}}", "Jamie")
    .replaceAll("{{discount}}", discountLabel)
    .replaceAll("{{referral_link}}", "https://refer.example/abc123")
    .replaceAll("{{discount_description}}", discountDescription || "on your next visit");
}

export function StepOffer({
  name,
  onNameChange,
  messageTemplate,
  onMessageTemplateChange,
  emailSubject,
  onEmailSubjectChange,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
  discountDescription,
  onDiscountDescriptionChange,
}: StepOfferProps) {
  const discountLabel = discountType === "percent" ? `${discountValue}%` : `$${discountValue}`;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Campaign name">
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Discount type">
            <select
              value={discountType}
              onChange={(e) => onDiscountTypeChange(e.target.value as DiscountType)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>
          <Field label="Value">
            <input
              type="number"
              min={0}
              value={discountValue}
              onChange={(e) => onDiscountValueChange(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
            />
          </Field>
          <Field label="Description">
            <input
              value={discountDescription}
              onChange={(e) => onDiscountDescriptionChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
              placeholder="on your next visit"
            />
          </Field>
        </div>

        <Field label="Email subject">
          <input
            value={emailSubject}
            onChange={(e) => onEmailSubjectChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
          />
        </Field>

        <Field label="Message template">
          <textarea
            value={messageTemplate}
            onChange={(e) => onMessageTemplateChange(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
          />
          <p className="mt-1 text-xs text-gray-500">
            Variables: {"{{first_name}}"}, {"{{discount}}"}, {"{{referral_link}}"},{" "}
            {"{{discount_description}}"}
          </p>
        </Field>
      </div>

      <div className="lg:pl-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MessageSquareText className="h-4 w-4" strokeWidth={1.75} />
          Live preview
        </div>
        <div className="mt-2 rounded-2xl border border-gray-200 bg-off-white/70 p-4">
          <p className="text-xs font-medium text-gray-500">Email subject</p>
          <p className="mt-1 text-sm font-semibold text-charcoal">{emailSubject || "—"}</p>
          <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3 text-sm text-charcoal">
            {renderPreview(messageTemplate, discountLabel, discountDescription) || "—"}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Preview uses sample data — actual sends personalize per contact.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
