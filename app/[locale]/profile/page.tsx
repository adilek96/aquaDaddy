import { getUserLoader } from "@/app/services/get-user-profile";
import { getUserMeLoader } from "@/app/services/get-user-me-loader";
import { ProfileEditPage } from "@/components/component/profile-edit-page";

export default async function Profile() {
  const userPromise = await getUserMeLoader();

  return (
    <>
      <ProfileEditPage user={userPromise} />
    </>
  );
}
