"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Scissors, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { IService, ServiceFormData } from "@/types";

const INITIAL_FORM: ServiceFormData = {
  name: "",
  category: "",
  duration: 60,
  price: 0,
  description: "",
  isActive: true,
  isFeatured: false,
};

export function ServicesClient() {
  const [services, setServices] = useState<IService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch both services and settings (for categories) in parallel
      const [resSvc, resSet] = await Promise.all([
        fetch("/api/services?admin=true"),
        fetch("/api/settings")
      ]);
      
      const jsonSvc = await resSvc.json();
      const jsonSet = await resSet.json();

      if (jsonSvc.success) setServices(jsonSvc.data);
      if (jsonSet.success && jsonSet.data?.serviceCategories) {
        // Map active category names
        setCategories(
          jsonSet.data.serviceCategories
            .filter((c: any) => c.isActive)
            .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
            .map((c: any) => c.name)
        );
      }
    } catch {
      toast.error("Network error while loading data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (service: IService) => {
    setEditingId(service._id!);
    setFormData({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      description: service.description || "",
      isActive: service.isActive,
      isFeatured: service.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    try {
      setIsSubmitting(true);
      const url = editingId ? `/api/services/${editingId}` : "/api/services";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      
      if (json.success) {
        toast.success(`Service ${editingId ? "updated" : "created"}`);
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(json.error || "Failed to save service");
      }
    } catch {
      toast.error("Network error saving service");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/services/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Service deleted (deactivated)");
        fetchData();
      } else {
        toast.error(json.error);
      }
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">Manage your studio&apos;s treatment menu</p>
        </div>
        <Button onClick={openCreate} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" /> Add Service
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle>Menu Options</CardTitle>
          <CardDescription>All active and inactive services.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-4 overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 px-4 text-muted-foreground border rounded-lg bg-muted/10 mx-6 mb-6 sm:mx-0 sm:mb-0">
              <Scissors className="size-10 mx-auto mb-3 opacity-20" />
              There are no services configured yet. Add your first treatment to begin taking bookings.
            </div>
          ) : (
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price (Rs.)</TableHead>
                    <TableHead>Duration (Min)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((svc) => (
                    <TableRow key={svc._id} className={!svc.isActive ? "opacity-60 bg-muted/30" : ""}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          {svc.name}
                          {svc.isFeatured && (
                            <Star className="size-3.5 fill-yellow-500 text-yellow-500" strokeWidth={1} />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                          {svc.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded bg-muted text-xs font-medium">
                          {svc.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{svc.price.toLocaleString()}</TableCell>
                      <TableCell>{svc.duration}</TableCell>
                      <TableCell>
                        {svc.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">Active</span>
                        ) : (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">Inactive</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(svc)} className="h-8 w-8">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(svc._id!)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Service" : "Add Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData(f => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="unassigned" disabled>No active categories in settings</SelectItem>
                    ) : (
                      categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (LKR) <span className="text-destructive">*</span></Label>
                <Input 
                  id="price" 
                  type="number" 
                  min={0}
                  value={formData.price} 
                  onChange={(e) => setFormData(f => ({ ...f, price: Number(e.target.value) }))} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Duration (Minutes)</Label>
              <Select 
                value={String(formData.duration)} 
                onValueChange={(v) => setFormData(f => ({ ...f, duration: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60, 90, 120, 150, 180, 240].map(m => (
                    <SelectItem key={m} value={String(m)}>{m} mins {m >= 60 ? `(${(m/60).toFixed(1)} hr)` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Textarea 
                id="desc" 
                value={formData.description} 
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} 
                rows={3} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Service</Label>
                  <p className="text-[10px] text-muted-foreground mr-2">Visible to customers.</p>
                </div>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(v) => setFormData(f => ({ ...f, isActive: v }))} 
                />
              </div>
              <div className="flex items-center justify-between border-l pl-4">
                <div>
                  <Label className="flex items-center gap-1"><Star className="size-3" /> Featured</Label>
                  <p className="text-[10px] text-muted-foreground mr-2">Shows on homepage.</p>
                </div>
                <Switch 
                  checked={formData.isFeatured} 
                  onCheckedChange={(v) => setFormData(f => ({ ...f, isFeatured: v }))} 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 gap-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 mr-2 animate-spin" />}
                {editingId ? "Update Service" : "Create Service"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Deactivate Server?</AlertDialogTitle>
            <AlertDialogDescription>
              This will safely deactivate the service so it can no longer be booked by customers. Unfinished bookings for this service will not be affected. 
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
