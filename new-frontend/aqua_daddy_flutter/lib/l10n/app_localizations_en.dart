// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'aquaDaddy';

  @override
  String get loginTitle => 'Welcome Back';

  @override
  String get loginSubtitle => 'Log in to your account';

  @override
  String get signInMethod => 'Sign in method';

  @override
  String get emailLabel => 'Email';

  @override
  String get passwordLabel => 'Password';

  @override
  String get signInButton => 'Sign In';

  @override
  String get googleSignIn => 'Sign in with Google';

  @override
  String get appleSignIn => 'Sign in with Apple';

  @override
  String get tryAnotherMethod => 'Try another method';

  @override
  String get myTanks => 'My Tanks';

  @override
  String get myAquariumsSubtitle =>
      'Explore and manage your aquatic ecosystems.';

  @override
  String get viewAquariums => 'View Aquariums';

  @override
  String get discovery => 'Discovery';

  @override
  String get discoverySubtitle =>
      'Uncover new species and explore the underwater world.';

  @override
  String get startExploring => 'Start Exploring';

  @override
  String get profile => 'Profile';

  @override
  String get addTank => 'Add Aquarium';

  @override
  String get tankTypeFreshwater => 'Freshwater';

  @override
  String get tankTypeSaltwater => 'Saltwater';

  @override
  String get tankTypePaludarium => 'Paludarium';

  @override
  String get searchAquariums => 'Search aquariums...';

  @override
  String get noResults => 'No aquariums found';

  @override
  String get currentStatus => 'Current Status';

  @override
  String get history => 'History';

  @override
  String get logNow => 'Log Now';

  @override
  String get inhabitants => 'Inhabitants';

  @override
  String get addSpecies => 'Add Species';

  @override
  String get maintenanceSection => 'Maintenance';

  @override
  String get logTask => 'Log Task';

  @override
  String get remindersSection => 'Reminders';

  @override
  String get addReminder => 'Add Reminder';

  @override
  String get photoGallery => 'Photo Gallery';

  @override
  String get addPhoto => 'Add Photo';

  @override
  String get communityComments => 'Community Comments';

  @override
  String get addComment => 'Add a comment...';

  @override
  String get noPhotos => 'No photos yet.';

  @override
  String get noComments => 'No comments yet. Be the first!';

  @override
  String get addPhotoUrl => 'Add Photo URL';

  @override
  String get enterImageUrl => 'Enter image URL';

  @override
  String get addInhabitant => 'Add Inhabitant';

  @override
  String get speciesName => 'Species Name';

  @override
  String get countLabel => 'Count';

  @override
  String get logMaintenance => 'Log Maintenance';

  @override
  String get maintenanceHint => 'What did you do? (e.g. Water Change)';

  @override
  String get setReminder => 'Set Reminder';

  @override
  String get reminderHint => 'What to remind? (e.g. Feed Fish)';

  @override
  String get set24h => 'SET (24h)';

  @override
  String get cancel => 'Cancel';

  @override
  String get add => 'Add';

  @override
  String get save => 'Save';

  @override
  String get send => 'Send';

  @override
  String get logout => 'Sign Out';

  @override
  String get language => 'Language';

  @override
  String get settings => 'Settings';

  @override
  String get communityMember => 'Community Member';

  @override
  String get logParameters => 'Log Parameters';

  @override
  String get tankName => 'Tank Name';

  @override
  String get volumeLabel => 'Volume (liters)';

  @override
  String get tankType => 'Tank Type';

  @override
  String get publicTank => 'Public Tank';

  @override
  String get createTank => 'Create Aquarium';

  @override
  String get errorLoading => 'Error loading data';

  @override
  String get loading => 'Loading...';

  @override
  String get anonymous => 'Anonymous';

  @override
  String get noAquariums => 'No aquariums yet. Add your first one!';

  @override
  String get wikiTitle => 'Wiki';

  @override
  String get wikiSubtitle => 'Browse 250+ fish, coral, and plant species.';

  @override
  String get wikiLink => 'Explore Species';

  @override
  String get measurementSystem => 'Measurement System';

  @override
  String get temperatureScale => 'Temperature Scale';

  @override
  String get themeLabel => 'Theme';

  @override
  String get themeSystem => 'System';

  @override
  String get themeLight => 'Light';

  @override
  String get themeDark => 'Dark';

  @override
  String get delete => 'Delete';

  @override
  String get deleteTitle => 'Delete?';

  @override
  String deleteInhabitantMessage(String species) {
    return 'Remove $species from this aquarium?';
  }

  @override
  String get deletePhotoMessage => 'Remove this photo?';

  @override
  String get deleteCommentMessage =>
      'Delete this comment? Replies will be removed too.';

  @override
  String get deleteReminderMessage => 'Delete this reminder?';

  @override
  String get deleted => 'Deleted';

  @override
  String get reply => 'Reply';

  @override
  String replyTo(String name) {
    return 'Reply to $name';
  }

  @override
  String get rateThisTank => 'Your rating';

  @override
  String ratingSummary(String average, int count) {
    return '$average out of 5 · $count ratings';
  }

  @override
  String get noRatings => 'No ratings yet';

  @override
  String get ratingSaved => 'Rating saved';

  @override
  String get tankShape => 'Shape';

  @override
  String get shapeRectangular => 'Rectangular';

  @override
  String get shapeCube => 'Cube';

  @override
  String get shapeBow => 'Bow front';

  @override
  String get shapeHexagon => 'Hexagon';

  @override
  String get shapeCylinder => 'Cylinder';

  @override
  String get shapeSphere => 'Sphere';

  @override
  String get shapeHemisphere => 'Hemisphere';

  @override
  String get lengthLabel => 'Length (cm)';

  @override
  String get widthLabel => 'Width (cm)';

  @override
  String get heightLabel => 'Height (cm)';

  @override
  String get depthLabel => 'Depth (cm)';

  @override
  String get diameterLabel => 'Diameter (cm)';

  @override
  String get sideLabel => 'Side (cm)';

  @override
  String get coefficientLabel => 'Bow coefficient';

  @override
  String get calculatedVolume => 'Calculated volume';

  @override
  String get requiredField => 'Required';

  @override
  String get invalidNumber => 'Enter a number';

  @override
  String get publicTankSubtitle => 'Allow others to see your tank in Discovery';

  @override
  String get tankCreated => 'Aquarium created';

  @override
  String get logWaterTitle => 'Log Water Parameters';

  @override
  String get saveLog => 'Save log';

  @override
  String get logSaved => 'Parameters saved';

  @override
  String get fillAtLeastOne => 'Fill in at least one parameter';

  @override
  String get moreParameters => 'More parameters';

  @override
  String get paramTemperature => 'Temperature (°C)';

  @override
  String get paramNitrite => 'Nitrite (NO2)';

  @override
  String get paramNitrate => 'Nitrate (NO3)';

  @override
  String get paramAmmonia => 'Ammonia (NH3)';

  @override
  String get paramAmmonium => 'Ammonium (NH4)';

  @override
  String get paramPhosphate => 'Phosphate (PO4)';

  @override
  String get paramGh => 'General hardness (GH)';

  @override
  String get paramKh => 'Carbonate hardness (KH)';

  @override
  String get paramCalcium => 'Calcium (Ca)';

  @override
  String get paramMagnesium => 'Magnesium (Mg)';

  @override
  String get paramPotassium => 'Potassium (K)';

  @override
  String get paramIron => 'Iron (Fe)';

  @override
  String get paramSalinity => 'Salinity';

  @override
  String get parameterHistory => 'Parameter history';

  @override
  String get noChartData => 'Not enough measurements yet';

  @override
  String get deleteMaintenanceMessage => 'Delete this maintenance record?';

  @override
  String get maintenanceType => 'What was done';

  @override
  String get pickDate => 'Date';

  @override
  String get pickTime => 'Time';

  @override
  String get mtWaterChange => 'Water change';

  @override
  String get mtGravelCleaning => 'Gravel cleaning';

  @override
  String get mtGlassCleaning => 'Glass cleaning';

  @override
  String get mtFilterCleaning => 'Filter cleaning';

  @override
  String get mtParameterCheck => 'Parameter check';

  @override
  String get mtPlantCare => 'Plant care';

  @override
  String get mtCoralCare => 'Coral care';

  @override
  String get mtSupplements => 'Supplements';

  @override
  String get mtAlgaeControl => 'Algae control';

  @override
  String get mtOther => 'Other';

  @override
  String get statusCompleted => 'Completed';

  @override
  String get statusPending => 'Pending';

  @override
  String get statusSkipped => 'Skipped';

  @override
  String get statusCancelled => 'Cancelled';

  @override
  String get selectAtLeastOneType => 'Pick at least one type';

  @override
  String get reminderWhen => 'Remind at';
}
