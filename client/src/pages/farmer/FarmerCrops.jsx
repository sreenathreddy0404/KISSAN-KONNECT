import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import CropCard from "@/components/CropCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, ImageIcon, Play, Pause } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cropCategories } from "@/data/categoriesData";
import toast from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getMyCrops, createCrop, updateCrop, deleteCrop, togglePauseCrop } from "@/services/api";

const defaultImages = {
  Vegetables: "https://images.unsplash.com/photo-1592924357228-91a4daadce55?w=400",
  Fruits: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
  Grains: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400",
  Pulses: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
  Spices: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400",
};

const FarmerCrops = () => {
  const { userId } = useAuth();
  const [myCrops, setMyCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCrop, setEditCrop] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [availQty, setAvailQty] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchMyCrops = async () => {
    try {
      setLoading(true);
      const res = await getMyCrops();
      setMyCrops(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your crops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCrops();
  }, []);

  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setMinQty("");
    setAvailQty("");
    setHarvestDate("");
    setLocation("");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setEditCrop(null);
  };

  const openEdit = (crop) => {
    setEditCrop(crop);
    setName(crop.name);
    setCategory(crop.category);
    setPrice(String(crop.pricePerKg));
    setMinQty(String(crop.minQuantityKg));
    setAvailQty(String(crop.availableQuantityKg));
    setHarvestDate(crop.harvestDate?.split("T")[0] || "");
    setLocation(crop.location);
    setDescription(crop.description);
    setImagePreview(crop.image);
    setImageFile(null);
    setOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!name || !category || !price || !minQty || !availQty || !location) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("pricePerKg", price);
    formData.append("minQuantityKg", minQty);
    formData.append("availableQuantityKg", availQty);
    formData.append("location", location);
    if (harvestDate) formData.append("harvestDate", harvestDate);
    if (description) formData.append("description", description);

    if (editCrop) {
      if (imageFile) formData.append("image", imageFile);
    } else {
      if (!imageFile) {
        toast.error("Please select a crop image");
        return;
      }
      formData.append("image", imageFile);
    }

    setSubmitting(true);
    try {
      if (editCrop) {
        await updateCrop(editCrop._id, formData);
        toast.success("Crop updated successfully! ✅");
      } else {
        await createCrop(formData);
        toast.success("Crop added successfully! 🌾");
      }
      await fetchMyCrops();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCrop(id);
      toast.success("Crop deleted");
      await fetchMyCrops();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete crop");
    }
  };

  const handleTogglePause = async (crop) => {
    try {
      const res = await togglePauseCrop(crop._id);
      toast.success(res.data.message || `Crop ${res.data.status === 'active' ? 'activated' : 'paused'}`);
      await fetchMyCrops();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Crops</h1>
          <p className="text-muted-foreground text-sm">
            Manage your listed crops ({myCrops.length} total)
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gradient-hero text-primary-foreground border-0">
              <Plus className="w-4 h-4 mr-1" /> Add Crop
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editCrop ? "Edit Crop" : "Add New Crop"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>Crop Image {!editCrop && "*"}</Label>
                <div className="mt-1 flex items-center gap-4">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border border-border">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-sm text-primary hover:underline">
                        {editCrop ? "Change image" : "Upload image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    {!editCrop && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Required. Max 5MB
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Crop Name *</Label>
                  <Input
                    placeholder="e.g. Organic Wheat"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price per Kg (₹) *</Label>
                  <Input
                    type="number"
                    placeholder="32"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Min Quantity (kg) *</Label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={minQty}
                    onChange={(e) => setMinQty(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Available Quantity (kg) *</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={availQty}
                    onChange={(e) => setAvailQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Harvest Date</Label>
                  <Input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Location *</Label>
                <Input
                  placeholder="City, State"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your crop..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button
                className="w-full gradient-hero text-primary-foreground border-0"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {editCrop ? "Updating..." : "Adding..."}
                  </>
                ) : editCrop ? (
                  "Update Crop"
                ) : (
                  "Add Crop"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myCrops.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">No crops listed yet</p>
          <p className="text-sm">Click "Add Crop" to start selling!</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {myCrops.map((crop) => (
          <CropCard
            key={crop._id}
            crop={crop}
            actions={
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => openEdit(crop)}
                >
                  <Pencil className="w-3 h-3 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={crop.status === 'active' ? "hover:bg-destructive hover:text-destructive-foreground" : "text-green-600 hover:text-green-700"}
                  onClick={() => handleTogglePause(crop)}
                >
                  {crop.status === 'active' ? (
                    <Pause className="w-3 h-3 mr-1" />
                  ) : (
                    <Play className="w-3 h-3 mr-1" />
                  )}
                  {crop.status === 'active' ? "Pause" : "Activate"}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{crop.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently remove the
                        crop listing.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(crop._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
};

export default FarmerCrops;