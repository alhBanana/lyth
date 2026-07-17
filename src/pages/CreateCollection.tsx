import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";
import CollectionForm from "../components/CollectionForm";
import type { CollectionFormValues } from "../components/CollectionForm";
import SectionHeading from "../components/SectionHeading";
import { useStoryContext } from "../contexts/useStoryContext";
import { ApiError } from "../services/api";

/**
 * Generates a URL-safe slug from a Collection name.
 *
 * @param value - The Collection name to convert.
 * @returns A lowercase, hyphen-separated slug.
 */


/**
 * Displays the form for creating a new Library Collection.
 *
 * The Collection can optionally be linked to the active Story when it
 * is created. Shared Collection fields are managed by CollectionForm,
 * while this page manages creation-specific application behaviour.
 *
 * @returns The Create Collection page.
 */
export default function CreateCollection() {
  const navigate = useNavigate();
  const { story, createNewCollection } = useStoryContext();

  const [linkToStory, setLinkToStory] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Creates and persists a new Collection.
   *
   * The backend generates the Collection slug from the submitted name.
   * The newly created Collection can optionally be linked to the active Story.
   *
   * @param values - The validated values provided by CollectionForm.
   */
  const handleSubmit = async (values: CollectionFormValues) => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const created = await createNewCollection({
        name: values.name,
        description: values.description,
        category: values.category || undefined,
        linkToStoryId: linkToStory ? story.id : undefined,
      });

      navigate(`/collections/${created.slug}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to create Collection. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        title="Create Collection"
        subtitle="Add a reusable Collection to your Library and optionally link it to your active Story."
      />

      <Card>
        <div className="space-y-6">
          <CollectionForm
            submitLabel="Save Collection"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/library")}
          />

          <div className="rounded-xl border border-[#E8E4DD] bg-[#FAF8F4] px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Slug</p>
            <p className="mt-1">
              A slug will be generated automatically from the Collection name.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-[#E8E4DD] bg-white px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={linkToStory}
              onChange={(event) => setLinkToStory(event.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 h-4 w-4 rounded border-[#CBD5E1] text-[#2F5D50] focus:ring-[#2F5D50]"
            />

            <span>Link this Collection to {story.title}</span>
          </label>
        </div>
      </Card>
    </div>
  );
}