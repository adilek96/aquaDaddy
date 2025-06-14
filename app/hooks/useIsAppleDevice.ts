// ** Что делает этот код: 
//    Это кастомный хук который проверяет принадлежит ли устройство пользователю к apple **//

import { useEffect, useState } from "react";

const useIsAppleDevice = (): boolean => {
  const [isAppleDevice, setIsAppleDevice] = useState(false);

  useEffect(() => {
    // Проверка, что код выполняется на клиенте
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      const userAgent = navigator.userAgent || navigator.vendor || "";
      const platform = navigator.platform || "";

      const isApple =
        /Mac|iPhone|iPad|iPod/i.test(userAgent) ||
        /Mac|iPhone|iPad|iPod/i.test(platform);

      setIsAppleDevice(isApple);
    }
  }, []);

  return isAppleDevice;
};

export default  useIsAppleDevice;
