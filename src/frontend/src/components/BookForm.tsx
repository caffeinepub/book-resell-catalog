import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { BookCondition, useAddBook, useUpdateBook } from "../hooks/useQueries";
import type { Book } from "../hooks/useQueries";
import { ExternalBlob } from "../utils/blob";

interface BookFormProps {
  book?: Book;
  onSuccess: () => void;
  onCancel: () => void;
}

const SKELETONS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

export default function BookForm({ book, onSuccess, onCancel }: BookFormProps) {
  const addBook = useAddBook();
  const updateBook = useUpdateBook();

  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [description, setDescription] = useState(book?.description ?? "");
  const [condition, setCondition] = useState<BookCondition>(
    book?.condition ?? BookCondition.good,
  );
  const [price, setPrice] = useState(book?.price ?? "");
  const [imageId, setImageId] = useState<string | null>(book?.imageId ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    book?.imageId ? ExternalBlob.fromURL(book.imageId).getDirectURL() : null,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const isPending = addBook.isPending || updateBook.isPending;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setUploading(true);
    setUploadProgress(0);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      const url = blob.getDirectURL();
      setImageId(url);
    } catch {
      setPreviewUrl(null);
      setImageId(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = { title, author, description, condition, price, imageId };
    if (book) {
      await updateBook.mutateAsync({ ...input, id: book.id });
    } else {
      await addBook.mutateAsync(input);
    }
    onSuccess();
  };

  const triggerFileInput = () => fileRef.current?.click();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. The Great Gatsby"
          required
          data-ocid="bookform.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. F. Scott Fitzgerald"
          required
          data-ocid="bookform.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the book..."
          rows={3}
          required
          data-ocid="bookform.textarea"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Condition</Label>
          <Select
            value={condition}
            onValueChange={(v) => setCondition(v as BookCondition)}
          >
            <SelectTrigger data-ocid="bookform.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={BookCondition.new_}>New</SelectItem>
              <SelectItem value={BookCondition.good}>Good</SelectItem>
              <SelectItem value={BookCondition.fair}>Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. $12.99"
            required
            data-ocid="bookform.input"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Cover Image</Label>
        <button
          type="button"
          className="w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors relative"
          onClick={triggerFileInput}
          data-ocid="bookform.dropzone"
        >
          {previewUrl ? (
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Cover preview"
                className="h-32 object-cover rounded mx-auto"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewUrl(null);
                  setImageId(null);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground py-4">
              <Upload className="w-8 h-8" />
              <p className="text-sm">Click to upload cover image</p>
              <p className="text-xs">PNG, JPG up to 10MB</p>
            </div>
          )}
          {uploading && (
            <div className="mt-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Uploading {uploadProgress}%
              </p>
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
          data-ocid="bookform.upload_button"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-ocid="bookform.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || uploading}
          className="flex-1"
          data-ocid="bookform.submit_button"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {book ? "Save Changes" : "Add Book"}
        </Button>
      </div>
    </form>
  );
}

export { SKELETONS };
