"use client";

import { useState } from "react";
import { FolderTree, Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ISettings, ServiceCategoryConfig as ICategory } from "@/types";

interface ServiceCategoryConfigProps {
  settings: ISettings;
  onSave: (update: Partial<ISettings>) => Promise<boolean>;
  isSaving: boolean;
}

/**
 * Service Categories configuration.
 * Allows adding, reordering, and toggling visibility of service categories.
 */
export function ServiceCategoryConfig({
  settings,
  onSave,
  isSaving,
}: ServiceCategoryConfigProps) {
  const [categories, setCategories] = useState<ICategory[]>(
    [...settings.serviceCategories].sort((a, b) => a.displayOrder - b.displayOrder)
  );
  const [newCatName, setNewCatName] = useState("");

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;

    // Check if exists
    if (categories.some((c) => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      return;
    }

    const maxOrder = categories.reduce((max, c) => Math.max(max, c.displayOrder), 0);
    
    setCategories((prev) => [
      ...prev,
      {
        name: newCatName.trim(),
        displayOrder: maxOrder + 1,
        isActive: true,
      },
    ]);
    setNewCatName("");
  };

  const handleRemoveCategory = (index: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleActive = (index: number, active: boolean) => {
    setCategories((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isActive: active };
      return copy;
    });
  };

  const handleOrderChange = (index: number, newOrder: number) => {
    setCategories((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], displayOrder: newOrder };
      return copy.sort((a, b) => a.displayOrder - b.displayOrder);
    });
  };

  const handleSave = async () => {
    await onSave({ serviceCategories: categories });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderTree className="size-5" />
          Service Categories
        </CardTitle>
        <CardDescription>
          Manage the categories used to group your services. Inactive categories won&apos;t be shown to customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Add Category */}
        <div className="flex gap-3 items-end">
          <div className="space-y-2 flex-1 max-w-sm">
            <Input
              placeholder="e.g., Facial Treatments"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            />
          </div>
          <Button onClick={handleAddCategory} disabled={!newCatName.trim()}>
            <Plus className="size-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Categories List */}
        <div className="space-y-3">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className="flex items-center gap-4 p-3 rounded-lg border border-border bg-card group"
            >
              <GripVertical className="size-4 text-muted-foreground/50 cursor-grab" />
              
              <div className="flex-1 font-medium text-sm">{cat.name}</div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Order:</span>
                  <Input
                    type="number"
                    min={0}
                    className="w-16 h-8 text-center text-xs"
                    value={cat.displayOrder}
                    onChange={(e) => handleOrderChange(index, Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={cat.isActive}
                    onCheckedChange={(v) => handleToggleActive(index, v)}
                  />
                  <span className="text-xs min-w-[40px]">
                    {cat.isActive ? "Active" : "Hidden"}
                  </span>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-50 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove "{cat.name}" from settings. Make sure no active services are using this category before deleting.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveCategory(index)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg bg-muted/10">
              No categories configured.
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Save Categories
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
