import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, MessageCircle, Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useListBooks } from "../hooks/useQueries";
import type { Book } from "../hooks/useQueries";
import { BookCondition } from "../hooks/useQueries";

const WHATSAPP_NUMBER = "919876725815";
const STORE_NAME = "5aab Books";
const STORE_TAGLINE = "Curated reads at honest prices";

const CONDITION_COLORS: Record<BookCondition, string> = {
  [BookCondition.new_]: "bg-emerald-100 text-emerald-800 border-emerald-200",
  [BookCondition.good]: "bg-blue-100 text-blue-800 border-blue-200",
  [BookCondition.fair]: "bg-amber-100 text-amber-800 border-amber-200",
};

const CONDITION_LABELS: Record<BookCondition, string> = {
  [BookCondition.new_]: "New",
  [BookCondition.good]: "Good",
  [BookCondition.fair]: "Fair",
};

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

function getImageSrc(imageId: string | null): string {
  if (!imageId) return "/assets/generated/bookshop-hero.dim_1200x400.jpg";
  // Use Google Drive or other direct URLs as-is
  if (imageId.startsWith("http")) return imageId;
  return "/assets/generated/bookshop-hero.dim_1200x400.jpg";
}

function getWhatsAppUrl(book: Book): string {
  const text = `Hi, I'm interested in "${book.title}" by ${book.author} priced at ${book.price}. Is it still available?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function BookCard({ book, index }: { book: Book; index: number }) {
  const coverSrc = getImageSrc(book.imageId ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="group bg-card rounded-lg border border-border shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
      data-ocid={`books.item.${index + 1}`}
    >
      <div className="relative overflow-hidden bg-muted aspect-[3/4] flex-shrink-0">
        <img
          src={coverSrc}
          alt={`${book.title} cover`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "/assets/generated/bookshop-hero.dim_1200x400.jpg";
          }}
        />
        <div className="absolute top-2 right-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full border ${CONDITION_COLORS[book.condition]}`}
          >
            {CONDITION_LABELS[book.condition]}
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <h3 className="font-semibold text-base leading-snug line-clamp-2 text-foreground">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">{book.author}</p>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {book.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
          <span className="font-bold text-lg text-foreground">
            {book.price}
          </span>
          <a
            href={getWhatsAppUrl(book)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
            data-ocid={`books.whatsapp_button.${index + 1}`}
          >
            <MessageCircle className="w-4 h-4" />
            Order
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function BookSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-12 w-full" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const { data: books, isLoading } = useListBooks();
  const [search, setSearch] = useState("");

  const filtered = (books ?? []).filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-56 sm:h-72 overflow-hidden"
        data-ocid="catalog.section"
      >
        <img
          src="/assets/generated/bookshop-hero.dim_1200x400.jpg"
          alt="Bookshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl sm:text-5xl font-bold text-white drop-shadow-md"
          >
            {STORE_NAME}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-white/90 mt-2 text-base sm:text-lg"
          >
            {STORE_TAGLINE}
          </motion.p>
        </div>
      </section>

      {/* Search + Catalog */}
      <section className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or author..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-ocid="catalog.search_input"
            />
          </div>
        </div>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="catalog.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <BookSkeleton key={k} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="catalog.empty_state"
          >
            <BookOpen className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              No books found
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {search
                ? "Try a different search term."
                : "Check back soon for new arrivals!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
