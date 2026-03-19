import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import BookForm from "../components/BookForm";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteBook,
  useIsAdmin,
  useListBooks,
  useSeedBooks,
} from "../hooks/useQueries";
import type { Book } from "../hooks/useQueries";
import { BookCondition } from "../hooks/useQueries";
import { ExternalBlob } from "../utils/blob";

const CONDITION_LABELS: Record<BookCondition, string> = {
  [BookCondition.new_]: "New",
  [BookCondition.good]: "Good",
  [BookCondition.fair]: "Fair",
};

const CONDITION_VARIANT: Record<
  BookCondition,
  "default" | "secondary" | "outline"
> = {
  [BookCondition.new_]: "default",
  [BookCondition.good]: "secondary",
  [BookCondition.fair]: "outline",
};

const FALLBACK_COVERS: Record<string, string> = {
  "The Great Gatsby": "/assets/generated/book-gatsby.dim_300x400.jpg",
  "To Kill a Mockingbird": "/assets/generated/book-mockingbird.dim_300x400.jpg",
  "1984": "/assets/generated/book-1984.dim_300x400.jpg",
  "Pride and Prejudice": "/assets/generated/book-pride.dim_300x400.jpg",
  "The Alchemist": "/assets/generated/book-alchemist.dim_300x400.jpg",
  Sapiens: "/assets/generated/book-sapiens.dim_300x400.jpg",
};

const ADMIN_SKELETON_KEYS = ["a", "b", "c", "d"];

export default function AdminPage() {
  const { identity, loginStatus } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: books, isLoading: booksLoading } = useListBooks();
  const deleteBook = useDeleteBook();
  const seedBooks = useSeedBooks();

  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
        data-ocid="admin.section"
      >
        <ShieldAlert className="w-14 h-14 text-muted-foreground/40 mb-4" />
        <h2 className="font-display text-2xl font-700 text-foreground">
          Admin Access Required
        </h2>
        <p className="text-muted-foreground mt-2">
          Please log in using the button in the header.
        </p>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert className="w-14 h-14 text-destructive/60 mb-4" />
        <h2 className="font-display text-2xl font-700 text-foreground">
          Not Authorized
        </h2>
        <p className="text-muted-foreground mt-2">
          Your account does not have admin privileges.
        </p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBook.mutateAsync(deleteId);
      toast.success("Book deleted");
    } catch {
      toast.error("Failed to delete book");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div
      className="container max-w-6xl mx-auto px-4 py-8"
      data-ocid="admin.section"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-700 text-foreground">
            Manage Books
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {books?.length ?? 0} book{books?.length !== 1 ? "s" : ""} in catalog
          </p>
        </div>
        <div className="flex gap-2">
          {(!books || books.length === 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                seedBooks
                  .mutateAsync()
                  .then(() => toast.success("Sample books added!"))
                  .catch(() => toast.error("Seed failed"))
              }
              disabled={seedBooks.isPending}
              data-ocid="admin.seed_button"
            >
              {seedBooks.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Seed Sample Books"
              )}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setAddOpen(true)}
            className="gap-1"
            data-ocid="admin.open_modal_button"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </Button>
        </div>
      </div>

      {booksLoading ? (
        <div className="grid gap-3" data-ocid="admin.loading_state">
          {ADMIN_SKELETON_KEYS.map((k) => (
            <Skeleton key={k} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !books || books.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-24 text-center"
          data-ocid="admin.empty_state"
        >
          <BookOpen className="w-14 h-14 text-muted-foreground/40 mb-4" />
          <h2 className="font-display text-xl font-600 text-foreground">
            No books yet
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Click "Add Book" to add your first listing.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {books.map((book, i) => {
              const coverSrc = book.imageId
                ? ExternalBlob.fromURL(book.imageId).getDirectURL()
                : (FALLBACK_COVERS[book.title] ??
                  "/assets/generated/book-gatsby.dim_300x400.jpg");
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 bg-card border border-border rounded-lg p-3 hover:shadow-xs transition-shadow"
                  data-ocid={`admin.item.${i + 1}`}
                >
                  <img
                    src={coverSrc}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/assets/generated/book-gatsby.dim_300x400.jpg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-600 text-sm truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {book.author}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={CONDITION_VARIANT[book.condition]}
                        className="text-xs"
                      >
                        {CONDITION_LABELS[book.condition]}
                      </Badge>
                      <span className="text-sm font-600">{book.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditBook(book)}
                      data-ocid={`admin.edit_button.${i + 1}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(book.id)}
                      data-ocid={`admin.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Book Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Add New Book
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the new book listing.
            </DialogDescription>
          </DialogHeader>
          <BookForm
            onSuccess={() => {
              setAddOpen(false);
              toast.success("Book added successfully!");
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={!!editBook} onOpenChange={(o) => !o && setEditBook(null)}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Edit Book
            </DialogTitle>
            <DialogDescription>
              Update the details of this book listing.
            </DialogDescription>
          </DialogHeader>
          {editBook && (
            <BookForm
              book={editBook}
              onSuccess={() => {
                setEditBook(null);
                toast.success("Book updated!");
              }}
              onCancel={() => setEditBook(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The book will be permanently removed
              from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.confirm_button"
            >
              {deleteBook.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
