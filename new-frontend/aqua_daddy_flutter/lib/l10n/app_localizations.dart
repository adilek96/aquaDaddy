import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_az.dart';
import 'app_localizations_en.dart';
import 'app_localizations_ru.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('az'),
    Locale('en'),
    Locale('ru'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'aquaDaddy'**
  String get appTitle;

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Welcome Back'**
  String get loginTitle;

  /// No description provided for @loginSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Log in to your account'**
  String get loginSubtitle;

  /// No description provided for @signInMethod.
  ///
  /// In en, this message translates to:
  /// **'Sign in method'**
  String get signInMethod;

  /// No description provided for @emailLabel.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get emailLabel;

  /// No description provided for @passwordLabel.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get passwordLabel;

  /// No description provided for @signInButton.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get signInButton;

  /// No description provided for @googleSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in with Google'**
  String get googleSignIn;

  /// No description provided for @appleSignIn.
  ///
  /// In en, this message translates to:
  /// **'Sign in with Apple'**
  String get appleSignIn;

  /// No description provided for @tryAnotherMethod.
  ///
  /// In en, this message translates to:
  /// **'Try another method'**
  String get tryAnotherMethod;

  /// No description provided for @myTanks.
  ///
  /// In en, this message translates to:
  /// **'My Tanks'**
  String get myTanks;

  /// No description provided for @myAquariumsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Explore and manage your aquatic ecosystems.'**
  String get myAquariumsSubtitle;

  /// No description provided for @viewAquariums.
  ///
  /// In en, this message translates to:
  /// **'View Aquariums'**
  String get viewAquariums;

  /// No description provided for @discovery.
  ///
  /// In en, this message translates to:
  /// **'Discovery'**
  String get discovery;

  /// No description provided for @discoverySubtitle.
  ///
  /// In en, this message translates to:
  /// **'Uncover new species and explore the underwater world.'**
  String get discoverySubtitle;

  /// No description provided for @startExploring.
  ///
  /// In en, this message translates to:
  /// **'Start Exploring'**
  String get startExploring;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @addTank.
  ///
  /// In en, this message translates to:
  /// **'Add Aquarium'**
  String get addTank;

  /// No description provided for @tankTypeFreshwater.
  ///
  /// In en, this message translates to:
  /// **'Freshwater'**
  String get tankTypeFreshwater;

  /// No description provided for @tankTypeSaltwater.
  ///
  /// In en, this message translates to:
  /// **'Saltwater'**
  String get tankTypeSaltwater;

  /// No description provided for @tankTypePaludarium.
  ///
  /// In en, this message translates to:
  /// **'Paludarium'**
  String get tankTypePaludarium;

  /// No description provided for @searchAquariums.
  ///
  /// In en, this message translates to:
  /// **'Search aquariums...'**
  String get searchAquariums;

  /// No description provided for @noResults.
  ///
  /// In en, this message translates to:
  /// **'No aquariums found'**
  String get noResults;

  /// No description provided for @currentStatus.
  ///
  /// In en, this message translates to:
  /// **'Current Status'**
  String get currentStatus;

  /// No description provided for @history.
  ///
  /// In en, this message translates to:
  /// **'History'**
  String get history;

  /// No description provided for @logNow.
  ///
  /// In en, this message translates to:
  /// **'Log Now'**
  String get logNow;

  /// No description provided for @inhabitants.
  ///
  /// In en, this message translates to:
  /// **'Inhabitants'**
  String get inhabitants;

  /// No description provided for @addSpecies.
  ///
  /// In en, this message translates to:
  /// **'Add Species'**
  String get addSpecies;

  /// No description provided for @maintenanceSection.
  ///
  /// In en, this message translates to:
  /// **'Maintenance'**
  String get maintenanceSection;

  /// No description provided for @logTask.
  ///
  /// In en, this message translates to:
  /// **'Log Task'**
  String get logTask;

  /// No description provided for @remindersSection.
  ///
  /// In en, this message translates to:
  /// **'Reminders'**
  String get remindersSection;

  /// No description provided for @addReminder.
  ///
  /// In en, this message translates to:
  /// **'Add Reminder'**
  String get addReminder;

  /// No description provided for @photoGallery.
  ///
  /// In en, this message translates to:
  /// **'Photo Gallery'**
  String get photoGallery;

  /// No description provided for @addPhoto.
  ///
  /// In en, this message translates to:
  /// **'Add Photo'**
  String get addPhoto;

  /// No description provided for @communityComments.
  ///
  /// In en, this message translates to:
  /// **'Community Comments'**
  String get communityComments;

  /// No description provided for @addComment.
  ///
  /// In en, this message translates to:
  /// **'Add a comment...'**
  String get addComment;

  /// No description provided for @noPhotos.
  ///
  /// In en, this message translates to:
  /// **'No photos yet.'**
  String get noPhotos;

  /// No description provided for @noComments.
  ///
  /// In en, this message translates to:
  /// **'No comments yet. Be the first!'**
  String get noComments;

  /// No description provided for @addPhotoUrl.
  ///
  /// In en, this message translates to:
  /// **'Add Photo URL'**
  String get addPhotoUrl;

  /// No description provided for @enterImageUrl.
  ///
  /// In en, this message translates to:
  /// **'Enter image URL'**
  String get enterImageUrl;

  /// No description provided for @addInhabitant.
  ///
  /// In en, this message translates to:
  /// **'Add Inhabitant'**
  String get addInhabitant;

  /// No description provided for @speciesName.
  ///
  /// In en, this message translates to:
  /// **'Species Name'**
  String get speciesName;

  /// No description provided for @countLabel.
  ///
  /// In en, this message translates to:
  /// **'Count'**
  String get countLabel;

  /// No description provided for @logMaintenance.
  ///
  /// In en, this message translates to:
  /// **'Log Maintenance'**
  String get logMaintenance;

  /// No description provided for @maintenanceHint.
  ///
  /// In en, this message translates to:
  /// **'What did you do? (e.g. Water Change)'**
  String get maintenanceHint;

  /// No description provided for @setReminder.
  ///
  /// In en, this message translates to:
  /// **'Set Reminder'**
  String get setReminder;

  /// No description provided for @reminderHint.
  ///
  /// In en, this message translates to:
  /// **'What to remind? (e.g. Feed Fish)'**
  String get reminderHint;

  /// No description provided for @set24h.
  ///
  /// In en, this message translates to:
  /// **'SET (24h)'**
  String get set24h;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @add.
  ///
  /// In en, this message translates to:
  /// **'Add'**
  String get add;

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @send.
  ///
  /// In en, this message translates to:
  /// **'Send'**
  String get send;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Sign Out'**
  String get logout;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @communityMember.
  ///
  /// In en, this message translates to:
  /// **'Community Member'**
  String get communityMember;

  /// No description provided for @logParameters.
  ///
  /// In en, this message translates to:
  /// **'Log Parameters'**
  String get logParameters;

  /// No description provided for @tankName.
  ///
  /// In en, this message translates to:
  /// **'Tank Name'**
  String get tankName;

  /// No description provided for @volumeLabel.
  ///
  /// In en, this message translates to:
  /// **'Volume (liters)'**
  String get volumeLabel;

  /// No description provided for @tankType.
  ///
  /// In en, this message translates to:
  /// **'Tank Type'**
  String get tankType;

  /// No description provided for @publicTank.
  ///
  /// In en, this message translates to:
  /// **'Public Tank'**
  String get publicTank;

  /// No description provided for @createTank.
  ///
  /// In en, this message translates to:
  /// **'Create Aquarium'**
  String get createTank;

  /// No description provided for @errorLoading.
  ///
  /// In en, this message translates to:
  /// **'Error loading data'**
  String get errorLoading;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get loading;

  /// No description provided for @anonymous.
  ///
  /// In en, this message translates to:
  /// **'Anonymous'**
  String get anonymous;

  /// No description provided for @noAquariums.
  ///
  /// In en, this message translates to:
  /// **'No aquariums yet. Add your first one!'**
  String get noAquariums;

  /// No description provided for @wikiTitle.
  ///
  /// In en, this message translates to:
  /// **'Wiki'**
  String get wikiTitle;

  /// No description provided for @wikiSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Browse 250+ fish, coral, and plant species.'**
  String get wikiSubtitle;

  /// No description provided for @wikiLink.
  ///
  /// In en, this message translates to:
  /// **'Explore Species'**
  String get wikiLink;

  /// No description provided for @measurementSystem.
  ///
  /// In en, this message translates to:
  /// **'Measurement System'**
  String get measurementSystem;

  /// No description provided for @temperatureScale.
  ///
  /// In en, this message translates to:
  /// **'Temperature Scale'**
  String get temperatureScale;

  /// No description provided for @themeLabel.
  ///
  /// In en, this message translates to:
  /// **'Theme'**
  String get themeLabel;

  /// No description provided for @themeSystem.
  ///
  /// In en, this message translates to:
  /// **'System'**
  String get themeSystem;

  /// No description provided for @themeLight.
  ///
  /// In en, this message translates to:
  /// **'Light'**
  String get themeLight;

  /// No description provided for @themeDark.
  ///
  /// In en, this message translates to:
  /// **'Dark'**
  String get themeDark;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get delete;

  /// No description provided for @deleteTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete?'**
  String get deleteTitle;

  /// No description provided for @deleteInhabitantMessage.
  ///
  /// In en, this message translates to:
  /// **'Remove {species} from this aquarium?'**
  String deleteInhabitantMessage(String species);

  /// No description provided for @deletePhotoMessage.
  ///
  /// In en, this message translates to:
  /// **'Remove this photo?'**
  String get deletePhotoMessage;

  /// No description provided for @deleteCommentMessage.
  ///
  /// In en, this message translates to:
  /// **'Delete this comment? Replies will be removed too.'**
  String get deleteCommentMessage;

  /// No description provided for @deleteReminderMessage.
  ///
  /// In en, this message translates to:
  /// **'Delete this reminder?'**
  String get deleteReminderMessage;

  /// No description provided for @deleted.
  ///
  /// In en, this message translates to:
  /// **'Deleted'**
  String get deleted;

  /// No description provided for @reply.
  ///
  /// In en, this message translates to:
  /// **'Reply'**
  String get reply;

  /// No description provided for @replyTo.
  ///
  /// In en, this message translates to:
  /// **'Reply to {name}'**
  String replyTo(String name);

  /// No description provided for @rateThisTank.
  ///
  /// In en, this message translates to:
  /// **'Your rating'**
  String get rateThisTank;

  /// No description provided for @ratingSummary.
  ///
  /// In en, this message translates to:
  /// **'{average} out of 5 · {count} ratings'**
  String ratingSummary(String average, int count);

  /// No description provided for @noRatings.
  ///
  /// In en, this message translates to:
  /// **'No ratings yet'**
  String get noRatings;

  /// No description provided for @ratingSaved.
  ///
  /// In en, this message translates to:
  /// **'Rating saved'**
  String get ratingSaved;

  /// No description provided for @tankShape.
  ///
  /// In en, this message translates to:
  /// **'Shape'**
  String get tankShape;

  /// No description provided for @shapeRectangular.
  ///
  /// In en, this message translates to:
  /// **'Rectangular'**
  String get shapeRectangular;

  /// No description provided for @shapeCube.
  ///
  /// In en, this message translates to:
  /// **'Cube'**
  String get shapeCube;

  /// No description provided for @shapeBow.
  ///
  /// In en, this message translates to:
  /// **'Bow front'**
  String get shapeBow;

  /// No description provided for @shapeHexagon.
  ///
  /// In en, this message translates to:
  /// **'Hexagon'**
  String get shapeHexagon;

  /// No description provided for @shapeCylinder.
  ///
  /// In en, this message translates to:
  /// **'Cylinder'**
  String get shapeCylinder;

  /// No description provided for @shapeSphere.
  ///
  /// In en, this message translates to:
  /// **'Sphere'**
  String get shapeSphere;

  /// No description provided for @shapeHemisphere.
  ///
  /// In en, this message translates to:
  /// **'Hemisphere'**
  String get shapeHemisphere;

  /// No description provided for @lengthLabel.
  ///
  /// In en, this message translates to:
  /// **'Length (cm)'**
  String get lengthLabel;

  /// No description provided for @widthLabel.
  ///
  /// In en, this message translates to:
  /// **'Width (cm)'**
  String get widthLabel;

  /// No description provided for @heightLabel.
  ///
  /// In en, this message translates to:
  /// **'Height (cm)'**
  String get heightLabel;

  /// No description provided for @depthLabel.
  ///
  /// In en, this message translates to:
  /// **'Depth (cm)'**
  String get depthLabel;

  /// No description provided for @diameterLabel.
  ///
  /// In en, this message translates to:
  /// **'Diameter (cm)'**
  String get diameterLabel;

  /// No description provided for @sideLabel.
  ///
  /// In en, this message translates to:
  /// **'Side (cm)'**
  String get sideLabel;

  /// No description provided for @coefficientLabel.
  ///
  /// In en, this message translates to:
  /// **'Bow coefficient'**
  String get coefficientLabel;

  /// No description provided for @calculatedVolume.
  ///
  /// In en, this message translates to:
  /// **'Calculated volume'**
  String get calculatedVolume;

  /// No description provided for @requiredField.
  ///
  /// In en, this message translates to:
  /// **'Required'**
  String get requiredField;

  /// No description provided for @invalidNumber.
  ///
  /// In en, this message translates to:
  /// **'Enter a number'**
  String get invalidNumber;

  /// No description provided for @publicTankSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Allow others to see your tank in Discovery'**
  String get publicTankSubtitle;

  /// No description provided for @tankCreated.
  ///
  /// In en, this message translates to:
  /// **'Aquarium created'**
  String get tankCreated;

  /// No description provided for @logWaterTitle.
  ///
  /// In en, this message translates to:
  /// **'Log Water Parameters'**
  String get logWaterTitle;

  /// No description provided for @saveLog.
  ///
  /// In en, this message translates to:
  /// **'Save log'**
  String get saveLog;

  /// No description provided for @logSaved.
  ///
  /// In en, this message translates to:
  /// **'Parameters saved'**
  String get logSaved;

  /// No description provided for @fillAtLeastOne.
  ///
  /// In en, this message translates to:
  /// **'Fill in at least one parameter'**
  String get fillAtLeastOne;

  /// No description provided for @moreParameters.
  ///
  /// In en, this message translates to:
  /// **'More parameters'**
  String get moreParameters;

  /// No description provided for @paramTemperature.
  ///
  /// In en, this message translates to:
  /// **'Temperature (°C)'**
  String get paramTemperature;

  /// No description provided for @paramNitrite.
  ///
  /// In en, this message translates to:
  /// **'Nitrite (NO2)'**
  String get paramNitrite;

  /// No description provided for @paramNitrate.
  ///
  /// In en, this message translates to:
  /// **'Nitrate (NO3)'**
  String get paramNitrate;

  /// No description provided for @paramAmmonia.
  ///
  /// In en, this message translates to:
  /// **'Ammonia (NH3)'**
  String get paramAmmonia;

  /// No description provided for @paramAmmonium.
  ///
  /// In en, this message translates to:
  /// **'Ammonium (NH4)'**
  String get paramAmmonium;

  /// No description provided for @paramPhosphate.
  ///
  /// In en, this message translates to:
  /// **'Phosphate (PO4)'**
  String get paramPhosphate;

  /// No description provided for @paramGh.
  ///
  /// In en, this message translates to:
  /// **'General hardness (GH)'**
  String get paramGh;

  /// No description provided for @paramKh.
  ///
  /// In en, this message translates to:
  /// **'Carbonate hardness (KH)'**
  String get paramKh;

  /// No description provided for @paramCalcium.
  ///
  /// In en, this message translates to:
  /// **'Calcium (Ca)'**
  String get paramCalcium;

  /// No description provided for @paramMagnesium.
  ///
  /// In en, this message translates to:
  /// **'Magnesium (Mg)'**
  String get paramMagnesium;

  /// No description provided for @paramPotassium.
  ///
  /// In en, this message translates to:
  /// **'Potassium (K)'**
  String get paramPotassium;

  /// No description provided for @paramIron.
  ///
  /// In en, this message translates to:
  /// **'Iron (Fe)'**
  String get paramIron;

  /// No description provided for @paramSalinity.
  ///
  /// In en, this message translates to:
  /// **'Salinity'**
  String get paramSalinity;

  /// No description provided for @parameterHistory.
  ///
  /// In en, this message translates to:
  /// **'Parameter history'**
  String get parameterHistory;

  /// No description provided for @noChartData.
  ///
  /// In en, this message translates to:
  /// **'Not enough measurements yet'**
  String get noChartData;

  /// No description provided for @deleteMaintenanceMessage.
  ///
  /// In en, this message translates to:
  /// **'Delete this maintenance record?'**
  String get deleteMaintenanceMessage;

  /// No description provided for @maintenanceType.
  ///
  /// In en, this message translates to:
  /// **'What was done'**
  String get maintenanceType;

  /// No description provided for @pickDate.
  ///
  /// In en, this message translates to:
  /// **'Date'**
  String get pickDate;

  /// No description provided for @pickTime.
  ///
  /// In en, this message translates to:
  /// **'Time'**
  String get pickTime;

  /// No description provided for @mtWaterChange.
  ///
  /// In en, this message translates to:
  /// **'Water change'**
  String get mtWaterChange;

  /// No description provided for @mtGravelCleaning.
  ///
  /// In en, this message translates to:
  /// **'Gravel cleaning'**
  String get mtGravelCleaning;

  /// No description provided for @mtGlassCleaning.
  ///
  /// In en, this message translates to:
  /// **'Glass cleaning'**
  String get mtGlassCleaning;

  /// No description provided for @mtFilterCleaning.
  ///
  /// In en, this message translates to:
  /// **'Filter cleaning'**
  String get mtFilterCleaning;

  /// No description provided for @mtParameterCheck.
  ///
  /// In en, this message translates to:
  /// **'Parameter check'**
  String get mtParameterCheck;

  /// No description provided for @mtPlantCare.
  ///
  /// In en, this message translates to:
  /// **'Plant care'**
  String get mtPlantCare;

  /// No description provided for @mtCoralCare.
  ///
  /// In en, this message translates to:
  /// **'Coral care'**
  String get mtCoralCare;

  /// No description provided for @mtSupplements.
  ///
  /// In en, this message translates to:
  /// **'Supplements'**
  String get mtSupplements;

  /// No description provided for @mtAlgaeControl.
  ///
  /// In en, this message translates to:
  /// **'Algae control'**
  String get mtAlgaeControl;

  /// No description provided for @mtOther.
  ///
  /// In en, this message translates to:
  /// **'Other'**
  String get mtOther;

  /// No description provided for @statusCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get statusCompleted;

  /// No description provided for @statusPending.
  ///
  /// In en, this message translates to:
  /// **'Pending'**
  String get statusPending;

  /// No description provided for @statusSkipped.
  ///
  /// In en, this message translates to:
  /// **'Skipped'**
  String get statusSkipped;

  /// No description provided for @statusCancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get statusCancelled;

  /// No description provided for @selectAtLeastOneType.
  ///
  /// In en, this message translates to:
  /// **'Pick at least one type'**
  String get selectAtLeastOneType;

  /// No description provided for @reminderWhen.
  ///
  /// In en, this message translates to:
  /// **'Remind at'**
  String get reminderWhen;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['az', 'en', 'ru'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'az':
      return AppLocalizationsAz();
    case 'en':
      return AppLocalizationsEn();
    case 'ru':
      return AppLocalizationsRu();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
