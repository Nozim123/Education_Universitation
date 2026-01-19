import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Category = Tables<"categories">;

interface CreateArticleDialogProps {
  categories: Category[];
  onCreateArticle: (data: {
    title: string;
    content: string;
    excerpt?: string;
    category_id?: string;
    is_research?: boolean;
  }) => Promise<{ error?: Error | null }>;
}

export const CreateArticleDialog = ({
  categories,
  onCreateArticle,
}: CreateArticleDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isResearch, setIsResearch] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the title and content",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await onCreateArticle({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || undefined,
        category_id: categoryId || undefined,
        is_research: isResearch,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your article has been published",
      });

      // Reset form
      setTitle("");
      setContent("");
      setExcerpt("");
      setCategoryId("");
      setIsResearch(false);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish article. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FileText className="w-4 h-4" />
          Publish Article
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Publish New Article
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (Summary)</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief summary of your article..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your article content here... (Markdown supported)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Research Paper</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={isResearch}
                  onCheckedChange={setIsResearch}
                />
                <span className="text-sm text-muted-foreground">
                  {isResearch ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
