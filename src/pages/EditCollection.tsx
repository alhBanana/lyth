import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import CollectionForm from "../components/CollectionForm";
import type { CollectionFormValues } from "../components/CollectionForm";
import SectionHeading from "../components/SectionHeading";
import { useStoryContext } from "../contexts/useStoryContext";
import { ApiError } from "../services/api";

/**
 * Displays the form for editing an existing Library Collection.
 *
 * The Collection is identified using its stable database ID from the route.
 * Saving updates the persisted Collection through StoryContext and returns
 * the user to the Collection detail page.
 *
 * The Collection slug is intentionally not editable, ensuring existing
 * Collection URLs remain stable when the Collection name changes.
 *
 * @returns The Edit Collection page.
 */
export default function EditCollection() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const { collections, updateCollection } = useStoryContext();

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Finds the persisted Collection using the stable database ID
   * provided by the current route.
   */
  const collection = useMemo(
    () => collections.find((item) => item.id === collectionId),
    [collections, collectionId],
  );

  /**
   * Persists updated Collection values and returns to the
   * Collection detail page after a successful update.
   *
   * @param values - The validated values provided by CollectionForm.
   */
  const handleSubmit = async (values: CollectionFormValues) => {
    if (!collection) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      await updateCollection(collection.id, {
        name: values.name,
        description: values.description,
        category: values.category || undefined,
      });

      navigate(`/collections/${collection.slug}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to update Collection. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!collection) {
    return (
      <div className="space-y-6">
        <SectionHeading
          title="Collection not found"
          subtitle="Return to the Library and choose a Collection to edit."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title={`Edit ${collection.name}`}
        subtitle="Update the details for this Collection."
      />

      <Card>
        <CollectionForm
          initialValues={{
            name: collection.name,
            description: collection.description,
            category: collection.category ?? "",
          }}
          submitLabel="Save Changes"
          isSubmitting={isSaving}
          errorMessage={errorMessage}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/collections/${collection.slug}`)}
        />
      </Card>
    </div>
  );
}