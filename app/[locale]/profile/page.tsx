import { getUserMeLoader } from "@/app/services/get-user-me-loader";
import { ProfileEditPage } from "@/components/component/profile-edit-page";

export default async function Profile({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const userPromise = await getUserMeLoader();

  return (
    <>
      <ProfileEditPage user={userPromise} locale={locale} />
    </>
  );
}
