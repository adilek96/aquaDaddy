/**
 * Раньше здесь было три вложенных стеклянных контейнера (w-[95%] внутри
 * w-[95%] внутри flex-обёрток) с жёстким mt-20 под шапку. Отступ под
 * фиксированную шапку теперь задаёт .app-page в корневом layout, а ширину —
 * общий .app-container, поэтому поля совпадают со всеми остальными страницами.
 */
export default function MyTanksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
