import { useState } from "react";
import type { FormEvent } from "react";
import { collectionCategories } from "../utils/constants";

/**
 * Editable values managed by the Collection form.
 */
export type CollectionFormValues = {
  name: string;
  description: string;
  category: string;
};

/**
 * Props accepted by the shared Collection form.
 */
type CollectionFormProps = {
  /** Values used to populate the form when it first renders. */
  initialValues?: CollectionFormValues;

  /** Text displayed on the form's submit button. */
  submitLabel: string;

  /** Indicates whether the form is currently being submitted. */
  isSubmitting: boolean;

  /** Optional error message displayed above the form actions. */
  errorMessage?: string;

  /** Called with the validated form values when the form is submitted. */
  onSubmit: (values: CollectionFormValues) => void | Promise<void>;

  /** Called when the user cancels the form. */
  onCancel: () => void;
};

/**
 * Shared form for creating and editing Library Collections.
 *
 * The component manages editable Collection fields while delegating
 * persistence and navigation behaviour to the parent page.
 *
 * @param props - The Collection form configuration and event handlers.
 * @returns A reusable Collection form.
 */
export default function CollectionForm({
  initialValues = {
    name: "",
    description: "",
    category: "",
  },
  submitLabel,
  isSubmitting,
  errorMessage = "",
  onSubmit,
  onCancel,
}: CollectionFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [category, setCategory] = useState(initialValues.category);
  const [validationMessage, setValidationMessage] = useState("");

  /**
   * Validates the Collection fields before passing them to the parent page.
   *
   * @param event - The form submission event.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationMessage("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setValidationMessage("Collection name is required.");
      return;
    }

    await onSubmit({
      name: trimmedName,
      description: description.trim(),
      category,
    });
  };

  const displayedError = validationMessage || errorMessage;

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="collection-name"
          className="text-sm font-medium text-slate-800"
        >
          Name
        </label>

        <input
          id="collection-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
          maxLength={80}
          className="w-full rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2F5D50] disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="Running"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="collection-description"
          className="text-sm font-medium text-slate-800"
        >
          Description
        </label>

        <textarea
          id="collection-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          maxLength={240}
          className="min-h-24 w-full rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2F5D50] disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="Track progress over time."
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="collection-category"
          className="text-sm font-medium text-slate-800"
        >
          Category (optional)
        </label>

        <select
          id="collection-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-[#D8D2C7] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2F5D50] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <option value="">No category</option>

          {collectionCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {displayedError ? (
        <div className="rounded-xl border border-[#E6B9B9] bg-[#FFF6F6] px-4 py-3 text-sm text-[#8A2E2E]">
          {displayedError}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-[#2F5D50] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264B40] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-[#D8D2C7] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#2F5D50] hover:text-[#2F5D50] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}