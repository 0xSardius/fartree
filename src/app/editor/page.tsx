"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { WindowFrame } from "~/components/window-frame";
import { LinkCard } from "~/components/link-card";
import { useAuth } from "~/contexts/AuthContext";
import {
  Save,
  Eye,
  Share2,
  Plus,
  Globe,
  Wallet,
  Users,
  Palette,
  Settings,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";

// Link category icons mapping
const categoryIcons = {
  social: Users,
  crypto: Wallet,
  content: Globe,
  collabs: Users,
  default: Globe,
};

// Interface for our link data structure
interface ProfileLink {
  id: string;
  title: string;
  url: string;
  category?: string;
  position?: number;
  is_visible?: boolean;
  click_count?: number;
  auto_detected?: boolean;
  created_at?: string;
}

interface ProfileData {
  id: string;
  fid: number;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  theme?: string;
  links?: ProfileLink[];
}

export default function ProfileEditorInterface() {
  // Authentication and state management
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const totalClicks = useMemo(
    () => links.reduce((acc, link) => acc + (link.click_count || 0), 0),
    [links]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showEditLinkModal, setShowEditLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<ProfileLink | null>(null);
  const [editLinkTitle, setEditLinkTitle] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [updatingLink, setUpdatingLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Load profile and links data
  const loadProfileData = useCallback(async () => {
    if (!user?.fid) {
      console.log("⚠️ loadProfileData: No user FID available");
      return;
    }

    console.log("🔄 loadProfileData: Loading data for FID:", user.fid);
    setLoading(true);
    setError(null);

    try {
      // Load profile data
      console.log("📡 Fetching profile from /api/profiles/${user.fid}");
      const profileResponse = await fetch(`/api/profiles/${user.fid}`);
      console.log("📡 Profile response status:", profileResponse.status);

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("❌ Profile fetch failed:", errorText);
        throw new Error("Failed to load profile");
      }
      const profileData = await profileResponse.json();
      console.log("✅ Profile data received:", profileData);

      // Load links data
      console.log("📡 Fetching links from /api/profiles/${user.fid}/links");
      const linksResponse = await fetch(
        `/api/profiles/${user.fid}/links?include_hidden=true`
      );
      console.log("📡 Links response status:", linksResponse.status);

      if (!linksResponse.ok) {
        const errorText = await linksResponse.text();
        console.error("❌ Links fetch failed:", errorText);
        throw new Error("Failed to load links");
      }
      const linksData = await linksResponse.json();
      console.log("✅ Links data received:", linksData);

      setProfile(profileData.profile);
      setLinks(linksData.links || []);
      console.log(
        "✅ State updated - Profile:",
        !!profileData.profile,
        "Links:",
        linksData.links?.length || 0
      );
      console.log(
        "📋 Link titles:",
        linksData.links?.map((l: ProfileLink) => l.title).join(", ")
      );
    } catch (err) {
      console.error("❌ Error in loadProfileData:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [user?.fid]);

  // Load data on component mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileData();
    }
  }, [isAuthenticated, user, loadProfileData]);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!profile || !user?.fid) return false;

    setSaving(true);
    try {
      const response = await fetch(`/api/profiles/${user.fid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: profile.username,
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          theme: profile.theme,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Save failed:", errorData);
        throw new Error(errorData.error || "Failed to save profile");
      }

      const data = await response.json();
      console.log("✅ Profile saved successfully:", data);
      return true;
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle preview - save first, then navigate
  const handlePreview = async () => {
    if (!user?.fid || !profile) return;

    // Save profile first to ensure it exists in database
    console.log("💾 Saving profile before preview...");
    const saved = await handleSaveProfile();

    if (saved) {
      console.log("✅ Profile saved, navigating to preview...");
      router.push(`/profile/${user.fid}`);
    } else {
      console.error("❌ Failed to save profile, cannot preview");
      setError("Please fix errors and try saving again before previewing");
    }
  };

  // Reorder links with API call
  const handleLinkReorder = async (draggedId: string, targetId: string) => {
    const draggedIndex = links.findIndex((link) => link.id === draggedId);
    const targetIndex = links.findIndex((link) => link.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Optimistically update UI
    const newLinks = Array.from(links);
    const [reorderedItem] = newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, reorderedItem);

    // Update positions
    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      position: index,
    }));

    setLinks(updatedLinks);

    // Save to backend
    try {
      for (let i = 0; i < updatedLinks.length; i++) {
        const link = updatedLinks[i];
        await fetch(`/api/profiles/${user?.fid}/links/${link.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            position: i,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to save link order:", err);
      // Revert on error
      loadProfileData();
    }
  };

  // Add new link
  const handleAddLinkSubmit = async () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      console.log("⚠️ Title and URL are required");
      return;
    }

    try {
      setAddingLink(true);
      console.log("📝 Adding link:", { title: newLinkTitle, url: newLinkUrl });
      await handleAddLink({
        title: newLinkTitle,
        url: newLinkUrl,
        category: "content",
      });

      console.log("✅ Link added and profile reloaded!");

      // Reset form and close modal AFTER successful add
      setNewLinkTitle("");
      setNewLinkUrl("");
      setShowAddLinkModal(false);
    } catch (error) {
      console.error("❌ Error adding link:", error);
      // Don't close modal on error so user can see what happened
    } finally {
      setAddingLink(false);
    }
  };

  // Edit link functions
  const handleEditLinkClick = (link: ProfileLink) => {
    console.log("Edit link clicked:", link.id, link.title);
    setEditingLink(link);
    setEditLinkTitle(link.title);
    setEditLinkUrl(link.url);
    setShowEditLinkModal(true);
  };

  const handleEditLinkSubmit = async () => {
    if (!editLinkTitle.trim() || !editLinkUrl.trim() || !editingLink) {
      console.log("Title, URL, and link selection are required");
      return;
    }

    try {
      setUpdatingLink(true);
      console.log("Updating link:", {
        id: editingLink.id,
        title: editLinkTitle,
        url: editLinkUrl,
      });
      await handleUpdateLink(editingLink.id, {
        title: editLinkTitle,
        url: editLinkUrl,
      });

      // Reset form and close modal
      setEditLinkTitle("");
      setEditLinkUrl("");
      setEditingLink(null);
      setShowEditLinkModal(false);
      console.log("Link updated successfully");
    } catch (error) {
      console.error("Error updating link:", error);
    } finally {
      setUpdatingLink(false);
    }
  };

  const handleUpdateLink = async (
    linkId: string,
    linkData: { title: string; url: string }
  ) => {
    console.log("handleUpdateLink called with:", linkId, linkData);
    console.log("User state:", { fid: user?.fid, isAuthenticated, user });

    if (!user?.fid) {
      console.error("No user FID available");
      setError("User not authenticated or missing FID");
      return;
    }

    try {
      console.log(
        "Making API request to:",
        `/api/profiles/${user.fid}/links/${linkId}`
      );
      const response = await fetch(
        `/api/profiles/${user.fid}/links/${linkId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(linkData),
        }
      );

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(
          `Failed to update link: ${response.status} ${errorData}`
        );
      }

      const result = await response.json();
      console.log("Link updated successfully:", result);

      // Reload data to get the updated link
      await loadProfileData();
    } catch (err) {
      console.error("Error in handleUpdateLink:", err);
      setError(err instanceof Error ? err.message : "Failed to update link");
    }
  };

  const handleAddLink = async (linkData: {
    title: string;
    url: string;
    category?: string;
  }) => {
    console.log("handleAddLink called with:", linkData);
    console.log("User state:", { fid: user?.fid, isAuthenticated, user });

    if (!user?.fid) {
      console.error("No user FID available");
      setError("User not authenticated or missing FID");
      return;
    }

    try {
      console.log("Making API request to:", `/api/profiles/${user.fid}/links`);
      const response = await fetch(`/api/profiles/${user.fid}/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(linkData),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API error response:", errorData);
        throw new Error(`Failed to add link: ${response.status} ${errorData}`);
      }

      const result = await response.json();
      console.log("✅ Link added successfully:", result);

      // Reload data to get the new link
      console.log("🔄 Reloading profile data after adding link...");
      await loadProfileData();
      console.log("✅ Profile data reloaded, new links count:", links.length);
    } catch (err) {
      console.error("❌ Error in handleAddLink:", err);
      setError(err instanceof Error ? err.message : "Failed to add link");
      throw err; // Re-throw so handleAddLinkSubmit knows it failed
    }
  };

  // Delete link
  const handleDeleteLink = async (linkId: string) => {
    console.log("🗑️ Deleting link:", linkId);
    if (!user?.fid) {
      console.error("No user FID available for delete");
      return;
    }

    try {
      console.log(
        "Making DELETE request to:",
        `/api/profiles/${user.fid}/links/${linkId}`
      );
      const response = await fetch(
        `/api/profiles/${user.fid}/links/${linkId}`,
        {
          method: "DELETE",
        }
      );

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
        throw new Error("Failed to delete link");
      }

      console.log("✅ Delete successful, updating state");
      // Remove from state using functional update to avoid stale closure
      setLinks((currentLinks) => {
        const newLinks = currentLinks.filter((link) => link.id !== linkId);
        console.log("Updated links count:", newLinks.length);
        return newLinks;
      });
    } catch (err) {
      console.error("Error in handleDeleteLink:", err);
      setError(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  // Toggle link visibility (currently unused but kept for future feature)
  // Commenting out to avoid unused variable warning
  /*
  const handleToggleVisibility = async (linkId: string) => {
    const link = links.find(l => l.id === linkId)
    if (!link || !user?.fid) return

    try {
      const response = await fetch(`/api/profiles/${user.fid}/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_visible: !link.is_visible
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update link visibility')
      }

      // Update state
      setLinks(links.map(l => 
        l.id === linkId 
          ? { ...l, is_visible: !l.is_visible }
          : l
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link visibility')
    }
  }
  */

  // Get icon for category
  const getIconForCategory = (category?: string) => {
    if (!category) return categoryIcons.default;
    const lowerCategory = category.toLowerCase();
    return (
      categoryIcons[lowerCategory as keyof typeof categoryIcons] ||
      categoryIcons.default
    );
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-fartree-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fartree-primary-purple" />
          <p className="text-fartree-text-primary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-fartree-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-fartree-text-primary mb-4">Error: {error}</p>
          <Button
            onClick={loadProfileData}
            className="bg-fartree-primary-purple hover:bg-fartree-accent-purple"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-fartree-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-fartree-text-primary mb-4">
            Please sign in to edit your profile
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="bg-fartree-primary-purple hover:bg-fartree-accent-purple"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fartree-background flex flex-col items-center justify-center p-2 md:p-4 font-mono">
      <WindowFrame
        title="Fartree Editor"
        className="w-full max-w-md md:max-w-6xl h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)]"
        contentClassName="flex flex-col h-full p-0"
      >
        {/* Top Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between p-3 border-b-2 border-fartree-border-dark bg-fartree-window-header gap-2">
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              onClick={handleSaveProfile}
              disabled={saving || !profile || !user?.fid}
              className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary flex-1 md:flex-none disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!user?.fid || !profile || saving}
              className="border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background hover:text-fartree-accent-purple bg-transparent flex-1 md:flex-none disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" />{" "}
              {saving ? "Saving..." : "Preview"}
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/discover")}
              disabled={!user?.fid}
              className="border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background hover:text-fartree-accent-purple bg-transparent flex-1 md:flex-none disabled:opacity-50"
            >
              <Users className="w-4 h-4 mr-2" /> Discover
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const url = `${window.location.origin}/profile/${user?.fid}`;
              navigator.clipboard.writeText(url);
              // You could add a toast notification here
              console.log("Profile URL copied to clipboard");
            }}
            className="border-fartree-border-dark text-fartree-text-primary hover:bg-fartree-window-background hover:text-fartree-accent-purple bg-transparent w-full md:w-auto"
          >
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          {/* Analytics Badge */}
          {totalClicks > 0 && (
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-fartree-border-dark bg-fartree-window-background">
              <Eye className="w-4 h-4 text-fartree-accent-purple" />
              <div className="text-xs">
                <span className="text-fartree-text-secondary">
                  Total Views:
                </span>{" "}
                <span className="font-semibold text-fartree-text-primary">
                  {totalClicks}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[280px_1fr_280px] bg-fartree-window-background overflow-hidden min-h-0">
          {/* Left Sidebar: Profile Preview */}
          <div className="hidden md:flex flex-col p-4 border-r-2 border-fartree-border-dark bg-fartree-window-background overflow-y-auto">
            <h2 className="text-lg font-semibold text-fartree-text-primary mb-4">
              Profile Preview
            </h2>
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="w-20 h-20 border-2 border-fartree-primary-purple mb-3">
                <AvatarImage
                  src={
                    profile?.avatar_url ||
                    user?.avatar_url ||
                    "/placeholder.svg"
                  }
                  alt={profile?.display_name || user?.display_name}
                />
                <AvatarFallback>
                  {(profile?.display_name || user?.display_name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-fartree-text-primary">
                {profile?.display_name || user?.display_name}
              </h3>
              <p className="text-fartree-text-secondary text-sm">
                @{profile?.username || user?.username}
              </p>
              <p className="text-fartree-text-secondary text-xs mt-2">
                {profile?.bio || user?.bio}
              </p>
            </div>
            <div className="flex-1 grid gap-2">
              {links.slice(0, 3).map((link) => {
                const IconComponent = getIconForCategory(link.category);
                return (
                  <LinkCard
                    key={link.id}
                    icon={IconComponent}
                    title={link.title}
                    description={link.url}
                    category={link.category}
                    clickCount={link.click_count}
                    isAutoDetected={link.auto_detected}
                    className="!bg-fartree-window-background"
                  />
                );
              })}
              {links.length > 3 && (
                <p className="text-xs text-fartree-text-secondary text-center">
                  +{links.length - 3} more links
                </p>
              )}
            </div>
          </div>

          {/* Center Area: Link Management */}
          <div className="flex flex-col p-4 bg-fartree-window-background overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-fartree-text-primary">
                  Your Links ({links.length})
                </h2>
                <p className="text-sm text-fartree-text-secondary">
                  {totalClicks} total clicks
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log("Add New Link button clicked - opening modal");
                  setShowAddLinkModal(true);
                }}
                disabled={addingLink}
                className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary disabled:opacity-50"
              >
                <Plus className="w-4 h-4 mr-2" /> Add New Link
              </Button>
            </div>

            {links.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <Globe className="w-12 h-12 mx-auto mb-4 text-fartree-text-secondary" />
                  <h3 className="text-lg font-medium text-fartree-text-primary mb-2">
                    No links yet
                  </h3>
                  <p className="text-fartree-text-secondary mb-4">
                    Add your first link to get started!
                  </p>
                  <Button
                    onClick={() => {
                      console.log(
                        "Add Your First Link button clicked - opening modal"
                      );
                      setShowAddLinkModal(true);
                    }}
                    disabled={addingLink}
                    className="bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Your First Link
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-2 w-full"
                key={`links-container-${links.length}`}
              >
                {(() => {
                  console.log(
                    "🎨 Rendering links:",
                    links.length,
                    "links in state"
                  );
                  console.log(
                    "🔍 Link IDs:",
                    links.map((l: ProfileLink) => l.id)
                  );
                  console.log(
                    "🔍 Link titles:",
                    links.map((l: ProfileLink) => l.title)
                  );

                  // Find the link with the most clicks (minimum 1 click to qualify)
                  const maxClicks = Math.max(
                    ...links.map((l: ProfileLink) => l.click_count || 0)
                  );
                  const mostClickedId =
                    maxClicks > 0
                      ? links.find(
                          (l: ProfileLink) => (l.click_count || 0) === maxClicks
                        )?.id
                      : null;

                  return links.map((link, index) => {
                    console.log(
                      `  -> Rendering link ${index}:`,
                      link.title,
                      link.id
                    );
                    const IconComponent = getIconForCategory(link.category);
                    const isMostClicked = mostClickedId === link.id;

                    return (
                      <div
                        key={link.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("linkId", link.id);
                          setDraggedItem(link.id);
                        }}
                        onDragEnd={() => setDraggedItem(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          const draggedId = e.dataTransfer.getData("linkId");
                          if (draggedId !== link.id) {
                            handleLinkReorder(draggedId, link.id);
                          }
                        }}
                        className={`cursor-grab active:cursor-grabbing transition-opacity ${
                          draggedItem === link.id ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        <LinkCard
                          icon={IconComponent}
                          title={link.title}
                          description={link.url}
                          clickCount={link.click_count}
                          category={link.category}
                          isAutoDetected={link.auto_detected}
                          isMostClicked={isMostClicked}
                          editable
                          onEdit={() => handleEditLinkClick(link)}
                          className={!link.is_visible ? "opacity-60" : ""}
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Right Panel: Customization Options */}
          <div className="hidden md:flex flex-col p-4 border-l-2 border-fartree-border-dark bg-fartree-window-background overflow-y-auto">
            <h2 className="text-lg font-semibold text-fartree-text-primary mb-4">
              Customization
            </h2>
            <div className="grid gap-6">
              <div>
                <h3 className="font-medium text-fartree-text-primary mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4" /> Theme & Colors
                </h3>
                <div className="grid gap-2">
                  <Label
                    htmlFor="theme-select"
                    className="text-fartree-text-secondary"
                  >
                    Theme
                  </Label>
                  <Input id="theme-select" defaultValue="Light Retro" />
                  <Label
                    htmlFor="primary-color"
                    className="text-fartree-text-secondary"
                  >
                    Primary Color
                  </Label>
                  <Input
                    id="primary-color"
                    type="color"
                    defaultValue="#8465CB"
                    className="h-8 w-full"
                  />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-fartree-text-primary mb-2 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> Layout
                </h3>
                <div className="grid gap-2">
                  <Label
                    htmlFor="layout-style"
                    className="text-fartree-text-secondary"
                  >
                    Layout Style
                  </Label>
                  <Input id="layout-style" defaultValue="Grid" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-fartree-text-primary mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Visibility
                </h3>
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="show-click-count"
                    className="text-fartree-text-secondary"
                  >
                    Show Click Count
                  </Label>
                  <Switch id="show-click-count" defaultChecked />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Label
                    htmlFor="show-categories"
                    className="text-fartree-text-secondary"
                  >
                    Show Categories
                  </Label>
                  <Switch id="show-categories" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </div>
      </WindowFrame>

      {/* Add Link Modal */}
      {showAddLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-fartree-window-background border-2 border-fartree-border-dark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-fartree-text-primary mb-4">
              Add New Link
            </h3>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="link-title"
                  className="text-fartree-text-secondary"
                >
                  Link Title
                </Label>
                <Input
                  id="link-title"
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Enter link title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="link-url"
                  className="text-fartree-text-secondary"
                >
                  Link URL
                </Label>
                <Input
                  id="link-url"
                  type="text"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className="mt-1"
                />
                <p className="text-xs text-fartree-text-secondary mt-1">
                  Protocol (https://) will be added automatically if missing
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowAddLinkModal(false);
                  setNewLinkTitle("");
                  setNewLinkUrl("");
                }}
                variant="outline"
                className="flex-1"
                disabled={addingLink}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLinkSubmit}
                disabled={
                  addingLink || !newLinkTitle.trim() || !newLinkUrl.trim()
                }
                className="flex-1 bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary disabled:opacity-50"
              >
                {addingLink ? "Adding..." : "Add Link"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Link Modal */}
      {showEditLinkModal && editingLink && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              setShowEditLinkModal(false);
              setEditLinkTitle("");
              setEditLinkUrl("");
              setEditingLink(null);
            }
          }}
        >
          <div
            className="bg-fartree-window-background border-2 border-fartree-border-dark rounded-lg p-6 w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <h3 className="text-lg font-semibold text-fartree-text-primary flex-1 min-w-0">
                Edit Link
              </h3>
              <button
                type="button"
                onClick={() => {
                  console.log("🗑️ Delete button clicked!");
                  setShowDeleteConfirm(true);
                }}
                disabled={updatingLink}
                className="relative z-10 flex items-center justify-center w-8 h-8 min-w-[32px] min-h-[32px] rounded border border-red-300 bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-500 disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 pointer-events-none" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="edit-link-title"
                  className="text-fartree-text-secondary"
                >
                  Link Title
                </Label>
                <Input
                  id="edit-link-title"
                  type="text"
                  value={editLinkTitle}
                  onChange={(e) => setEditLinkTitle(e.target.value)}
                  placeholder="Enter link title..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label
                  htmlFor="edit-link-url"
                  className="text-fartree-text-secondary"
                >
                  Link URL
                </Label>
                <Input
                  id="edit-link-url"
                  type="text"
                  value={editLinkUrl}
                  onChange={(e) => setEditLinkUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className="mt-1"
                />
                <p className="text-xs text-fartree-text-secondary mt-1">
                  Protocol (https://) will be added automatically if missing
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowEditLinkModal(false);
                  setEditLinkTitle("");
                  setEditLinkUrl("");
                  setEditingLink(null);
                }}
                variant="outline"
                className="flex-1"
                disabled={updatingLink}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditLinkSubmit}
                disabled={
                  updatingLink || !editLinkTitle.trim() || !editLinkUrl.trim()
                }
                className="flex-1 bg-fartree-primary-purple hover:bg-fartree-accent-purple text-fartree-text-primary disabled:opacity-50"
              >
                {updatingLink ? "Updating..." : "Update Link"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && editingLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-fartree-window-background border-2 border-fartree-border-dark rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-fartree-text-primary mb-2">
              Delete Link?
            </h3>
            <p className="text-fartree-text-secondary mb-6">
              Are you sure you want to delete &quot;
              <span className="font-semibold">{editingLink.title}</span>&quot;?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  console.log("❌ User cancelled deletion");
                  setShowDeleteConfirm(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log("✅ User confirmed deletion");
                  handleDeleteLink(editingLink.id);
                  setShowDeleteConfirm(false);
                  setShowEditLinkModal(false);
                  setEditLinkTitle("");
                  setEditLinkUrl("");
                  setEditingLink(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
