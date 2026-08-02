// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Azerbaijani (`az`).
class AppLocalizationsAz extends AppLocalizations {
  AppLocalizationsAz([String locale = 'az']) : super(locale);

  @override
  String get appTitle => 'aquaDaddy';

  @override
  String get loginTitle => 'Xoş gəlmisiniz';

  @override
  String get loginSubtitle => 'Hesabınıza daxil olun';

  @override
  String get signInMethod => 'Giriş üsulu';

  @override
  String get emailLabel => 'E-poçt';

  @override
  String get passwordLabel => 'Şifrə';

  @override
  String get signInButton => 'Daxil ol';

  @override
  String get googleSignIn => 'Google ilə daxil ol';

  @override
  String get appleSignIn => 'Apple ilə daxil ol';

  @override
  String get tryAnotherMethod => 'Başqa üsul';

  @override
  String get myTanks => 'Akvariumlarım';

  @override
  String get myAquariumsSubtitle => 'Su ekosistemlərinizi idarə edin.';

  @override
  String get viewAquariums => 'Akvariumlarım';

  @override
  String get discovery => 'Kəşf et';

  @override
  String get discoverySubtitle =>
      'Yeni növlər kəşf edin, su altı dünyasını öyrənin.';

  @override
  String get startExploring => 'Kəşfə başla';

  @override
  String get profile => 'Profil';

  @override
  String get addTank => 'Akvarium əlavə et';

  @override
  String get tankTypeFreshwater => 'Şirin su';

  @override
  String get tankTypeSaltwater => 'Duzlu su';

  @override
  String get tankTypePaludarium => 'Paludarium';

  @override
  String get searchAquariums => 'Akvarium axtar...';

  @override
  String get noResults => 'Akvarium tapılmadı';

  @override
  String get currentStatus => 'Cari vəziyyət';

  @override
  String get history => 'Tarixçə';

  @override
  String get logNow => 'Qeyd et';

  @override
  String get inhabitants => 'Sakinlər';

  @override
  String get addSpecies => 'Növ əlavə et';

  @override
  String get maintenanceSection => 'Texniki xidmət';

  @override
  String get logTask => 'Tapşırıq qeyd et';

  @override
  String get remindersSection => 'Xatırlatmalar';

  @override
  String get addReminder => 'Xatırlatma əlavə et';

  @override
  String get photoGallery => 'Foto qalereyası';

  @override
  String get addPhoto => 'Foto əlavə et';

  @override
  String get communityComments => 'İcma şərhləri';

  @override
  String get addComment => 'Şərh yazın...';

  @override
  String get noPhotos => 'Hələ foto yoxdur.';

  @override
  String get noComments => 'Hələ şərh yoxdur. İlk siz olun!';

  @override
  String get addPhotoUrl => 'URL ilə foto əlavə et';

  @override
  String get enterImageUrl => 'Şəkil URL-ini daxil edin';

  @override
  String get addInhabitant => 'Sakin əlavə et';

  @override
  String get speciesName => 'Növün adı';

  @override
  String get countLabel => 'Say';

  @override
  String get logMaintenance => 'Texniki xidməti qeyd et';

  @override
  String get maintenanceHint => 'Nə etdiniz? (məs. Su dəyişimi)';

  @override
  String get setReminder => 'Xatırlatma qur';

  @override
  String get reminderHint => 'Nəyi xatırlataq? (məs. Balıqları yemlə)';

  @override
  String get set24h => '24 saatda';

  @override
  String get cancel => 'Ləğv et';

  @override
  String get add => 'Əlavə et';

  @override
  String get save => 'Saxla';

  @override
  String get send => 'Göndər';

  @override
  String get logout => 'Çıxış';

  @override
  String get language => 'Dil';

  @override
  String get settings => 'Parametrlər';

  @override
  String get communityMember => 'İcma üzvü';

  @override
  String get logParameters => 'Parametrləri qeyd et';

  @override
  String get tankName => 'Akvarium adı';

  @override
  String get volumeLabel => 'Həcm (litr)';

  @override
  String get tankType => 'Akvarium növü';

  @override
  String get publicTank => 'İctimai akvarium';

  @override
  String get createTank => 'Akvarium yarat';

  @override
  String get errorLoading => 'Yükləmə xətası';

  @override
  String get loading => 'Yüklənir...';

  @override
  String get anonymous => 'Anonim';

  @override
  String get noAquariums => 'Hələ akvarium yoxdur. Birincini əlavə edin!';

  @override
  String get wikiTitle => 'Vikipediya';

  @override
  String get wikiSubtitle => '250-dən çox balıq, mərcən və bitki növü.';

  @override
  String get wikiLink => 'Növlərə bax';

  @override
  String get measurementSystem => 'Ölçü sistemi';

  @override
  String get temperatureScale => 'Temperatur şkalası';

  @override
  String get themeLabel => 'Tema';

  @override
  String get themeSystem => 'Sistem';

  @override
  String get themeLight => 'İşıqlı';

  @override
  String get themeDark => 'Qaranlıq';

  @override
  String get delete => 'Sil';

  @override
  String get deleteTitle => 'Silinsin?';

  @override
  String deleteInhabitantMessage(String species) {
    return '$species bu akvariumdan silinsin?';
  }

  @override
  String get deletePhotoMessage => 'Bu şəkil silinsin?';

  @override
  String get deleteCommentMessage =>
      'Şərh silinsin? Ona olan cavablar da silinəcək.';

  @override
  String get deleteReminderMessage => 'Xatırlatma silinsin?';

  @override
  String get deleted => 'Silindi';

  @override
  String get reply => 'Cavab ver';

  @override
  String replyTo(String name) {
    return '$name üçün cavab';
  }

  @override
  String get rateThisTank => 'Qiymətiniz';

  @override
  String ratingSummary(String average, int count) {
    return '5-dən $average · $count qiymət';
  }

  @override
  String get noRatings => 'Hələ qiymət yoxdur';

  @override
  String get ratingSaved => 'Qiymət yadda saxlanıldı';

  @override
  String get tankShape => 'Forma';

  @override
  String get shapeRectangular => 'Düzbucaqlı';

  @override
  String get shapeCube => 'Kub';

  @override
  String get shapeBow => 'Qabarıq ön tərəfli';

  @override
  String get shapeHexagon => 'Altıbucaqlı';

  @override
  String get shapeCylinder => 'Silindr';

  @override
  String get shapeSphere => 'Kürə';

  @override
  String get shapeHemisphere => 'Yarımkürə';

  @override
  String get lengthLabel => 'Uzunluq (sm)';

  @override
  String get widthLabel => 'En (sm)';

  @override
  String get heightLabel => 'Hündürlük (sm)';

  @override
  String get depthLabel => 'Dərinlik (sm)';

  @override
  String get diameterLabel => 'Diametr (sm)';

  @override
  String get sideLabel => 'Tərəf (sm)';

  @override
  String get coefficientLabel => 'Qabarıqlıq əmsalı';

  @override
  String get calculatedVolume => 'Hesablanmış həcm';

  @override
  String get requiredField => 'Mütləq sahə';

  @override
  String get invalidNumber => 'Rəqəm daxil edin';

  @override
  String get publicTankSubtitle =>
      'Akvariumunuz Discovery bölməsində göstərilsin';

  @override
  String get tankCreated => 'Akvarium yaradıldı';

  @override
  String get logWaterTitle => 'Su parametrlərinin ölçülməsi';

  @override
  String get saveLog => 'Ölçünü yadda saxla';

  @override
  String get logSaved => 'Parametrlər yadda saxlanıldı';

  @override
  String get fillAtLeastOne => 'Ən azı bir parametr doldurun';

  @override
  String get moreParameters => 'Daha çox parametr';

  @override
  String get paramTemperature => 'Temperatur (°C)';

  @override
  String get paramNitrite => 'Nitrit (NO2)';

  @override
  String get paramNitrate => 'Nitrat (NO3)';

  @override
  String get paramAmmonia => 'Ammonyak (NH3)';

  @override
  String get paramAmmonium => 'Ammonium (NH4)';

  @override
  String get paramPhosphate => 'Fosfat (PO4)';

  @override
  String get paramGh => 'Ümumi sərtlik (GH)';

  @override
  String get paramKh => 'Karbonat sərtliyi (KH)';

  @override
  String get paramCalcium => 'Kalsium (Ca)';

  @override
  String get paramMagnesium => 'Maqnezium (Mg)';

  @override
  String get paramPotassium => 'Kalium (K)';

  @override
  String get paramIron => 'Dəmir (Fe)';

  @override
  String get paramSalinity => 'Duzluluq';

  @override
  String get parameterHistory => 'Parametr tarixçəsi';

  @override
  String get noChartData => 'Hələ kifayət qədər ölçü yoxdur';

  @override
  String get deleteMaintenanceMessage => 'Bu texniki xidmət qeydi silinsin?';

  @override
  String get maintenanceType => 'Nə edildi';

  @override
  String get pickDate => 'Tarix';

  @override
  String get pickTime => 'Vaxt';

  @override
  String get mtWaterChange => 'Su dəyişimi';

  @override
  String get mtGravelCleaning => 'Qruntun təmizlənməsi';

  @override
  String get mtGlassCleaning => 'Şüşənin təmizlənməsi';

  @override
  String get mtFilterCleaning => 'Filtrin təmizlənməsi';

  @override
  String get mtParameterCheck => 'Parametrlərin yoxlanışı';

  @override
  String get mtPlantCare => 'Bitkilərə qulluq';

  @override
  String get mtCoralCare => 'Mərcanlara qulluq';

  @override
  String get mtSupplements => 'Əlavələrin verilməsi';

  @override
  String get mtAlgaeControl => 'Yosunlarla mübarizə';

  @override
  String get mtOther => 'Digər';

  @override
  String get statusCompleted => 'Tamamlandı';

  @override
  String get statusPending => 'Planlaşdırılıb';

  @override
  String get statusSkipped => 'Ötürüldü';

  @override
  String get statusCancelled => 'Ləğv edildi';

  @override
  String get selectAtLeastOneType => 'Ən azı bir növ seçin';

  @override
  String get reminderWhen => 'Xatırlat';
}
