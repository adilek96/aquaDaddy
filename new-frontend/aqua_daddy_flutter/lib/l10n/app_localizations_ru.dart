// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Russian (`ru`).
class AppLocalizationsRu extends AppLocalizations {
  AppLocalizationsRu([String locale = 'ru']) : super(locale);

  @override
  String get appTitle => 'aquaDaddy';

  @override
  String get loginTitle => 'С возвращением';

  @override
  String get loginSubtitle => 'Войдите в свой аккаунт';

  @override
  String get signInMethod => 'Способ входа';

  @override
  String get emailLabel => 'Электронная почта';

  @override
  String get passwordLabel => 'Пароль';

  @override
  String get signInButton => 'Войти';

  @override
  String get googleSignIn => 'Войти через Google';

  @override
  String get appleSignIn => 'Войти через Apple';

  @override
  String get tryAnotherMethod => 'Другой способ';

  @override
  String get myTanks => 'Мои аквариумы';

  @override
  String get myAquariumsSubtitle =>
      'Управляйте своими подводными экосистемами.';

  @override
  String get viewAquariums => 'Мои аквариумы';

  @override
  String get discovery => 'Обзор';

  @override
  String get discoverySubtitle =>
      'Открывайте новые виды и изучайте подводный мир.';

  @override
  String get startExploring => 'Начать изучение';

  @override
  String get profile => 'Профиль';

  @override
  String get addTank => 'Добавить аквариум';

  @override
  String get tankTypeFreshwater => 'Пресноводный';

  @override
  String get tankTypeSaltwater => 'Морской';

  @override
  String get tankTypePaludarium => 'Палюдариум';

  @override
  String get searchAquariums => 'Поиск аквариумов...';

  @override
  String get noResults => 'Аквариумы не найдены';

  @override
  String get currentStatus => 'Текущий статус';

  @override
  String get history => 'История';

  @override
  String get logNow => 'Записать';

  @override
  String get inhabitants => 'Обитатели';

  @override
  String get addSpecies => 'Добавить вид';

  @override
  String get maintenanceSection => 'Обслуживание';

  @override
  String get logTask => 'Записать задачу';

  @override
  String get remindersSection => 'Напоминания';

  @override
  String get addReminder => 'Добавить напоминание';

  @override
  String get photoGallery => 'Галерея';

  @override
  String get addPhoto => 'Добавить фото';

  @override
  String get communityComments => 'Комментарии';

  @override
  String get addComment => 'Написать комментарий...';

  @override
  String get noPhotos => 'Фото пока нет.';

  @override
  String get noComments => 'Комментариев нет. Будьте первым!';

  @override
  String get addPhotoUrl => 'Добавить фото по ссылке';

  @override
  String get enterImageUrl => 'Введите ссылку на изображение';

  @override
  String get addInhabitant => 'Добавить обитателя';

  @override
  String get speciesName => 'Название вида';

  @override
  String get countLabel => 'Количество';

  @override
  String get logMaintenance => 'Записать обслуживание';

  @override
  String get maintenanceHint => 'Что вы сделали? (например, Подмена воды)';

  @override
  String get setReminder => 'Установить напоминание';

  @override
  String get reminderHint => 'О чём напомнить? (например, Покормить рыбок)';

  @override
  String get set24h => 'Через 24ч';

  @override
  String get cancel => 'Отмена';

  @override
  String get add => 'Добавить';

  @override
  String get save => 'Сохранить';

  @override
  String get send => 'Отправить';

  @override
  String get logout => 'Выйти';

  @override
  String get language => 'Язык';

  @override
  String get settings => 'Настройки';

  @override
  String get communityMember => 'Участник сообщества';

  @override
  String get logParameters => 'Записать параметры';

  @override
  String get tankName => 'Название аквариума';

  @override
  String get volumeLabel => 'Объём (литры)';

  @override
  String get tankType => 'Тип аквариума';

  @override
  String get publicTank => 'Публичный аквариум';

  @override
  String get createTank => 'Создать аквариум';

  @override
  String get errorLoading => 'Ошибка загрузки';

  @override
  String get loading => 'Загрузка...';

  @override
  String get anonymous => 'Аноним';

  @override
  String get noAquariums => 'Аквариумов пока нет. Добавьте первый!';

  @override
  String get wikiTitle => 'Вики';

  @override
  String get wikiSubtitle => 'Более 250 видов рыб, кораллов и растений.';

  @override
  String get wikiLink => 'Смотреть виды';

  @override
  String get measurementSystem => 'Система измерений';

  @override
  String get temperatureScale => 'Шкала температур';

  @override
  String get themeLabel => 'Тема';

  @override
  String get themeSystem => 'Системная';

  @override
  String get themeLight => 'Светлая';

  @override
  String get themeDark => 'Тёмная';

  @override
  String get delete => 'Удалить';

  @override
  String get deleteTitle => 'Удалить?';

  @override
  String deleteInhabitantMessage(String species) {
    return 'Убрать $species из этого аквариума?';
  }

  @override
  String get deletePhotoMessage => 'Удалить это фото?';

  @override
  String get deleteCommentMessage =>
      'Удалить комментарий? Ответы на него тоже удалятся.';

  @override
  String get deleteReminderMessage => 'Удалить напоминание?';

  @override
  String get deleted => 'Удалено';

  @override
  String get reply => 'Ответить';

  @override
  String replyTo(String name) {
    return 'Ответ для $name';
  }

  @override
  String get rateThisTank => 'Ваша оценка';

  @override
  String ratingSummary(String average, int count) {
    return '$average из 5 · оценок: $count';
  }

  @override
  String get noRatings => 'Оценок пока нет';

  @override
  String get ratingSaved => 'Оценка сохранена';

  @override
  String get tankShape => 'Форма';

  @override
  String get shapeRectangular => 'Прямоугольный';

  @override
  String get shapeCube => 'Куб';

  @override
  String get shapeBow => 'С выгнутым фронтом';

  @override
  String get shapeHexagon => 'Шестигранный';

  @override
  String get shapeCylinder => 'Цилиндр';

  @override
  String get shapeSphere => 'Шар';

  @override
  String get shapeHemisphere => 'Полушарие';

  @override
  String get lengthLabel => 'Длина (см)';

  @override
  String get widthLabel => 'Ширина (см)';

  @override
  String get heightLabel => 'Высота (см)';

  @override
  String get depthLabel => 'Глубина (см)';

  @override
  String get diameterLabel => 'Диаметр (см)';

  @override
  String get sideLabel => 'Сторона (см)';

  @override
  String get coefficientLabel => 'Коэффициент выгиба';

  @override
  String get calculatedVolume => 'Расчётный объём';

  @override
  String get requiredField => 'Обязательное поле';

  @override
  String get invalidNumber => 'Введите число';

  @override
  String get publicTankSubtitle =>
      'Показывать аквариум другим в разделе Discovery';

  @override
  String get tankCreated => 'Аквариум создан';

  @override
  String get logWaterTitle => 'Замер параметров воды';

  @override
  String get saveLog => 'Сохранить замер';

  @override
  String get logSaved => 'Параметры сохранены';

  @override
  String get fillAtLeastOne => 'Заполните хотя бы один параметр';

  @override
  String get moreParameters => 'Ещё параметры';

  @override
  String get paramTemperature => 'Температура (°C)';

  @override
  String get paramNitrite => 'Нитриты (NO2)';

  @override
  String get paramNitrate => 'Нитраты (NO3)';

  @override
  String get paramAmmonia => 'Аммиак (NH3)';

  @override
  String get paramAmmonium => 'Аммоний (NH4)';

  @override
  String get paramPhosphate => 'Фосфаты (PO4)';

  @override
  String get paramGh => 'Общая жёсткость (GH)';

  @override
  String get paramKh => 'Карбонатная жёсткость (KH)';

  @override
  String get paramCalcium => 'Кальций (Ca)';

  @override
  String get paramMagnesium => 'Магний (Mg)';

  @override
  String get paramPotassium => 'Калий (K)';

  @override
  String get paramIron => 'Железо (Fe)';

  @override
  String get paramSalinity => 'Солёность';

  @override
  String get parameterHistory => 'История параметров';

  @override
  String get noChartData => 'Замеров пока недостаточно';

  @override
  String get deleteMaintenanceMessage => 'Удалить эту запись обслуживания?';

  @override
  String get maintenanceType => 'Что делали';

  @override
  String get pickDate => 'Дата';

  @override
  String get pickTime => 'Время';

  @override
  String get mtWaterChange => 'Подмена воды';

  @override
  String get mtGravelCleaning => 'Чистка грунта';

  @override
  String get mtGlassCleaning => 'Чистка стекла';

  @override
  String get mtFilterCleaning => 'Чистка фильтра';

  @override
  String get mtParameterCheck => 'Проверка параметров';

  @override
  String get mtPlantCare => 'Уход за растениями';

  @override
  String get mtCoralCare => 'Уход за кораллами';

  @override
  String get mtSupplements => 'Внесение добавок';

  @override
  String get mtAlgaeControl => 'Борьба с водорослями';

  @override
  String get mtOther => 'Другое';

  @override
  String get statusCompleted => 'Выполнено';

  @override
  String get statusPending => 'Запланировано';

  @override
  String get statusSkipped => 'Пропущено';

  @override
  String get statusCancelled => 'Отменено';

  @override
  String get selectAtLeastOneType => 'Выберите хотя бы один тип';

  @override
  String get reminderWhen => 'Напомнить';
}
