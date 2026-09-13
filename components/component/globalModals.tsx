"use client";

import dynamic from "next/dynamic";
import { useAquariumEditStore } from "@/store/aquariumEditStore";
import { useMaintenanceAddStore } from "@/store/maintenanceAddStore";
import { useMaintenanceEditStore } from "@/store/maintenanceEditStore";
import { useWaterParamsStore } from "@/store/waterParamsStore";
import { useImageFullscreenStore } from "@/store/imageFullscreenStore";
import { useSettingStore } from "@/store/modalsStore";

/**
 * Раньше все 13 модальных окон монтировались прямо в корневом layout, то есть
 * ~4000 строк клиентского кода уезжали в бандл каждой страницы — включая
 * главную и страницу входа, где ни одна из них не используется.
 *
 * Здесь каждое окно загружается отдельным чанком и только после того, как
 * соответствующий флаг в сторе стал true. Пока окно закрыто, его код не
 * скачивается вообще.
 */

const MaintenanceEditModal = dynamic(() => import("./maintenanceEditModal"), {
  ssr: false,
});
const MaintenanceAddModal = dynamic(() => import("./maintenanceAddModal"), {
  ssr: false,
});
const SuccessModal = dynamic(() => import("./successModal"), { ssr: false });
const WaterParamsModal = dynamic(() => import("./waterParamsModal"), {
  ssr: false,
});
const AquariumDescriptionModal = dynamic(
  () => import("./aquariumDescriptionModal"),
  { ssr: false }
);
const AquariumSpecificationsModal = dynamic(
  () => import("./aquariumSpecificationsModal"),
  { ssr: false }
);
const AquariumInhabitantsModal = dynamic(
  () => import("./aquariumInhabitantsModal"),
  { ssr: false }
);
const AquariumWaterParamsModal = dynamic(
  () => import("./aquariumWaterParamsModal"),
  { ssr: false }
);
const AquariumRemindersModal = dynamic(
  () => import("./aquariumRemindersModal"),
  { ssr: false }
);
const AquariumTimelineModal = dynamic(() => import("./aquariumTimelineModal"), {
  ssr: false,
});
const AquariumOverviewModal = dynamic(() => import("./aquariumOverviewModal"), {
  ssr: false,
});
const AquariumDeleteModal = dynamic(() => import("./aquariumDeleteModal"), {
  ssr: false,
});
const ImageFullscreenModal = dynamic(() => import("./imageFullscreenModal"), {
  ssr: false,
});

export default function GlobalModals() {
  // Точечные селекторы: компонент перерисовывается только при смене
  // конкретного флага, а не на любое изменение стора.
  const isDescriptionOpen = useAquariumEditStore((s) => s.isDescriptionModalOpen);
  const isSpecificationsOpen = useAquariumEditStore(
    (s) => s.isSpecificationsModalOpen
  );
  const isInhabitantsOpen = useAquariumEditStore((s) => s.isInhabitantsModalOpen);
  const isWaterParamsOpen = useAquariumEditStore((s) => s.isWaterParamsModalOpen);
  const isRemindersOpen = useAquariumEditStore((s) => s.isRemindersModalOpen);
  const isTimelineOpen = useAquariumEditStore((s) => s.isTimelineModalOpen);
  const isOverviewOpen = useAquariumEditStore((s) => s.isOverviewModalOpen);
  const isDeleteOpen = useAquariumEditStore((s) => s.isDeleteModalOpen);

  const isMaintenanceAddOpen = useMaintenanceAddStore((s) => s.isOpen);
  const isMaintenanceEditOpen = useMaintenanceEditStore((s) => s.isOpen);
  const isWaterParamsFormOpen = useWaterParamsStore((s) => s.isOpen);
  const isImageFullscreenOpen = useImageFullscreenStore((s) => s.isOpen);
  const isSuccessOpen = useSettingStore((s) => s.isSuccessModalOpen);

  return (
    <>
      {isMaintenanceEditOpen && <MaintenanceEditModal />}
      {isMaintenanceAddOpen && <MaintenanceAddModal />}
      {isSuccessOpen && <SuccessModal />}
      {isWaterParamsFormOpen && <WaterParamsModal />}
      {isDescriptionOpen && <AquariumDescriptionModal />}
      {isSpecificationsOpen && <AquariumSpecificationsModal />}
      {isInhabitantsOpen && <AquariumInhabitantsModal />}
      {isWaterParamsOpen && <AquariumWaterParamsModal />}
      {isRemindersOpen && <AquariumRemindersModal />}
      {isTimelineOpen && <AquariumTimelineModal />}
      {isOverviewOpen && <AquariumOverviewModal />}
      {isDeleteOpen && <AquariumDeleteModal />}
      {isImageFullscreenOpen && <ImageFullscreenModal />}
    </>
  );
}
