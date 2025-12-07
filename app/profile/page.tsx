"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchAquariumCount } from "@/app/actions/aquariumCountFetch";
import LoadingBlock from "@/components/ui/loadingBlock";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("Profile");
  const [aquariumCount, setAquariumCount] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signIn");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        bio: "",
      });
      if (session.user.id) {
        fetchAquariumCount(session.user.id).then(setAquariumCount);
      }
    }
  }, [session]);

  if (status === "loading") {
    return <LoadingBlock translate="Loading..." />;
  }

  if (!session?.user) {
    return null;
  }

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
  };

  const memberSince = "N/A"; // TODO: Add createdAt to user data

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[#00EBFF]/5 dark:bg-black/50 backdrop-blur-md border border-muted">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{t("title")}</CardTitle>
                <CardDescription>{t("subtitle")}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
                aria-label={isEditing ? "Cancel" : "Edit"}
              >
                {isEditing ? <FiX className="w-5 h-5" /> : <FiEdit2 className="w-5 h-5" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                <AvatarFallback>
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {!isEditing && (
                <h2 className="text-xl font-semibold">{session.user.name}</h2>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-background/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">{aquariumCount}</div>
                  <div className="text-sm text-muted-foreground">Aquariums</div>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Public</div>
                </CardContent>
              </Card>
              <Card className="bg-background/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-sm text-muted-foreground">Member since</div>
                  <div className="text-sm font-medium">{memberSince}</div>
                </CardContent>
              </Card>
            </div>

            {/* Form Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("username")}</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                ) : (
                  <div className="p-2 rounded-md bg-muted/50">{session.user.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="p-2 rounded-md bg-muted/50 text-muted-foreground">
                  {session.user.email}
                </div>
              </div>

              {session.user.country && (
                <div className="space-y-2">
                  <Label>{t("country")}</Label>
                  <div className="p-2 rounded-md bg-muted/50">{session.user.country}</div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio">{t("bio")}</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder={t("bioPlaceholder")}
                    rows={4}
                  />
                ) : (
                  <div className="p-2 rounded-md bg-muted/50 min-h-[100px]">
                    {formData.bio || t("bioPlaceholder")}
                  </div>
                )}
              </div>

              {isEditing && (
                <Button onClick={handleSave} className="w-full gap-2">
                  <FiSave className="w-4 h-4" />
                  {t("button")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
