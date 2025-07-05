import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PREDEFINED_CATEGORIES, searchCategories } from "@shared/categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Loader2, 
  Camera, 
  Video, 
  MapPin, 
  Hash,
  Image as ImageIcon,
  X,
  Check,
  ChevronsUpDown,
  Plus,
  FileText,
  Smile
} from "lucide-react";

const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
  content: z.string().min(1, "Content is required").max(1000, "Content must be under 1000 characters"),
  category: z.string().min(1, "Category is required"),
  isPublic: z.boolean().default(true),
  level: z.number().min(1),
  mediaType: z.enum(["text", "image", "video", "reel", "location"]).default("text"),
  mediaUrls: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface EnhancedCreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EnhancedCreatePostDialog({ open, onOpenChange }: EnhancedCreatePostDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [activeMediaType, setActiveMediaType] = useState<"text" | "image" | "video" | "reel" | "location">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      isPublic: true,
      level: (user?.level || 1) + 1,
      mediaType: "text",
      mediaUrls: [],
      tags: [],
      location: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your post has been created successfully!",
      });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/posts/user/" + user.id] });
        queryClient.invalidateQueries({ queryKey: ["/api/analytics/user/" + user.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/posts/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      form.reset();
      setSelectedTags([]);
      setCurrentTag("");
      setActiveMediaType("text");
      onOpenChange(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePostFormData) => {
    const finalData = {
      ...data,
      tags: selectedTags,
      mediaType: activeMediaType,
    };
    createPostMutation.mutate(finalData);
  };

  const handleFileUpload = (files: FileList | null, type: "image" | "video") => {
    if (!files) return;
    
    // In a real app, you would upload these files to a cloud storage service
    const urls = Array.from(files).map((_, index) => 
      `https://placeholder-${type}-${Date.now()}-${index}.com`
    );
    
    form.setValue("mediaUrls", urls);
    setActiveMediaType(type);
    
    toast({
      title: "Files Selected",
      description: `${files.length} ${type}(s) selected for upload`,
    });
  };

  const addTag = () => {
    if (currentTag.trim() && !selectedTags.includes(currentTag.trim())) {
      setSelectedTags([...selectedTags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationData = JSON.stringify({ latitude, longitude });
          form.setValue("location", locationData);
          setActiveMediaType("location");
          toast({
            title: "Location Added",
            description: "Your current location has been added to the post",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please check permissions.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const filteredCategories = searchCategories(categorySearch);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-coral flex items-center space-x-2">
              <span>Create New Post</span>
              <Badge variant="outline">Level {(user?.level || 1) + 1}</Badge>
            </DialogTitle>
          </DialogHeader>
          
          {/* Media Type Selector */}
          <div className="border-b border-gray-200 pb-4">
            <p className="text-sm text-gray-600 mb-3">Choose post type:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={activeMediaType === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveMediaType("text")}
                className="flex items-center space-x-1"
              >
                <FileText className="w-4 h-4" />
                <span>Text</span>
              </Button>
              <Button
                type="button"
                variant={activeMediaType === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveMediaType("image");
                  fileInputRef.current?.click();
                }}
                className="flex items-center space-x-1"
              >
                <Camera className="w-4 h-4" />
                <span>Photo</span>
              </Button>
              <Button
                type="button"
                variant={activeMediaType === "video" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveMediaType("video");
                  videoInputRef.current?.click();
                }}
                className="flex items-center space-x-1"
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </Button>
              <Button
                type="button"
                variant={activeMediaType === "reel" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveMediaType("reel");
                  videoInputRef.current?.click();
                }}
                className="flex items-center space-x-1"
              >
                <Video className="w-4 h-4" />
                <span>Reel</span>
              </Button>
              <Button
                type="button"
                variant={activeMediaType === "location" ? "default" : "outline"}
                size="sm"
                onClick={handleLocationAccess}
                className="flex items-center space-x-1"
              >
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </Button>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What's your post about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts, experiences, or achievements..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Category</FormLabel>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={`justify-between ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value
                              ? filteredCategories.find((category) => category.value === field.value)?.label
                              : "Select category"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search categories..." 
                            value={categorySearch}
                            onValueChange={setCategorySearch}
                          />
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {filteredCategories.map((category) => (
                              <CommandItem
                                value={category.label}
                                key={category.value}
                                onSelect={() => {
                                  form.setValue("category", category.value);
                                  setCategoryOpen(false);
                                  setCategorySearch("");
                                }}
                                className="flex items-center space-x-2"
                              >
                                <span className="text-lg">{category.icon}</span>
                                <span>{category.label}</span>
                                <Check
                                  className={`ml-auto h-4 w-4 ${
                                    category.value === field.value ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags Section */}
              <div className="space-y-3">
                <FormLabel>Tags</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                        <Hash className="w-3 h-3" />
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Post</FormLabel>
                      <div className="text-sm text-gray-500">
                        Make this post visible to all users
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={createPostMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="bg-coral hover:bg-coral/90"
                >
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Post"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files, "video")}
      />
    </>
  );
}