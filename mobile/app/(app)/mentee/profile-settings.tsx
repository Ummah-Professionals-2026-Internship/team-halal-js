import { useEffect, useState } from 'react';
import { View, Pressable, Image, ActivityIndicator, Switch } from 'react-native';
import { Text, TextInput } from '../../../components/AppText';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../components/Screen';
import { SimplePicker } from '../../../components/onboarding/SimplePicker';
import { SearchableSelectField } from '../../../components/onboarding/SearchableSelectField';
import { TagChipGroup } from '../../../components/onboarding/TagChipGroup';
import { AvailabilityCard } from '../../../components/dashboard/AvailabilityCard';
import { STATES_LIST, UNIVERSITIES_LIST, MAJORS_LIST } from '../../../constants/lists';
import { MENTOR_SERVICES } from '../../../constants/services';
import { cardShadow } from '../../../constants/theme';
import { uploadProfilePicture } from '../../../lib/upload-api';
import { resolveUploadUrl } from '../../../lib/upload-url';
import { formatPhoneNumber } from '../../../lib/format';
import { updateMenteeProfile, type AvailabilitySlot } from '../../../lib/onboarding-api';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '../../../lib/notifications-api';
import { useSession } from '../../../lib/session-context';

const ACADEMIC_STATUS_OPTIONS = [
  'Freshman (Year 1)',
  'Sophomore (Year 2)',
  'Junior (Year 3)',
  'Senior (Year 4)',
  'Graduate Student',
  'Not in College (Working)',
  'Internship',
  'Other',
];

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };
const inputClasses = 'h-[56px] bg-white rounded-lg px-4 text-base text-brand-text border border-brand-border';

export default function MenteeProfileSettings() {
  const { user, refreshUser } = useSession();

  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [university, setUniversity] = useState('');
  const [majors, setMajors] = useState<string[]>([]);
  const [academicStatus, setAcademicStatus] = useState('');
  const [desiredCareer, setDesiredCareer] = useState('');
  const [desiredServices, setDesiredServices] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [preferences, setPreferences] = useState<NotificationPreferences>({ email: true, sms: true, inApp: true });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [localPhotoUri, setLocalPhotoUri] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone ?? '');
    setState(user.state ?? '');
    setLinkedinUrl(user.linkedinUrl ?? '');
    setUniversity(user.university ?? '');
    setMajors(user.majors ?? []);
    setAcademicStatus(user.menteeProfile?.academicStatus ?? '');
    setDesiredCareer(user.menteeProfile?.desiredCareer ?? '');
    setDesiredServices(user.menteeProfile?.desiredServices ?? []);
    setAdditionalInfo(user.additionalInfo ?? '');
    getNotificationPreferences().then(setPreferences).catch(() => {});
  }, [user]);

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSavingPrefs(true);
    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preference');
      setPreferences(preferences);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setLocalPhotoUri(asset.uri);
    setUploadingPhoto(true);
    setError('');
    try {
      await uploadProfilePicture({
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile picture upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAvailabilitySave = async (slots: AvailabilitySlot[]) => {
    await updateMenteeProfile({ manualAvailabilitySlots: slots });
    await refreshUser();
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);
    setSubmitting(true);
    try {
      await updateMenteeProfile({
        phone,
        state,
        linkedinUrl,
        university,
        majors,
        academicStatus,
        desiredCareer,
        desiredServices,
        additionalInfo,
      });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  const avatarUrl = localPhotoUri || resolveUploadUrl(user?.profilePicture);
  const initial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  return (
    <Screen>
      <View className="flex-row items-center gap-3 mb-1">
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color="#00212C" />
        </Pressable>
        <Text className="text-2xl text-brand-text" style={fontBoldStyle}>Profile Settings</Text>
      </View>

      {error ? <Text className="text-brand-error" style={fontStyle}>{error}</Text> : null}
      {saved ? <Text className="text-brand-primary" style={fontStyle}>✓ Profile updated</Text> : null}

      <View className="items-center gap-2 py-2">
        <Pressable onPress={handlePickPhoto} disabled={uploadingPhoto}>
          {uploadingPhoto ? (
            <View className="w-24 h-24 rounded-full bg-slate-100 items-center justify-center">
              <ActivityIndicator color="#007CA6" />
            </View>
          ) : avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-24 h-24 rounded-full border-2 border-brand-primary" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-brand-button items-center justify-center">
              <Text className="text-white text-3xl" style={fontBoldStyle}>{initial}</Text>
            </View>
          )}
        </Pressable>
        <Text className="text-brand-primary text-sm" style={fontBoldStyle}>Tap to change photo</Text>
      </View>

      <Text className="text-sm text-brand-text mt-2" style={fontBoldStyle}>Contact</Text>

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#9a9a9a"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(v) => setPhone(formatPhoneNumber(v))}
        style={fontStyle}
        className={inputClasses}
      />

      <SimplePicker
        label="State"
        placeholder="Select state"
        value={state}
        options={STATES_LIST}
        onChange={setState}
      />

      <TextInput
        placeholder="LinkedIn URL"
        placeholderTextColor="#9a9a9a"
        autoCapitalize="none"
        value={linkedinUrl}
        onChangeText={setLinkedinUrl}
        style={fontStyle}
        className={inputClasses}
      />

      <Text className="text-sm text-brand-text mt-2" style={fontBoldStyle}>Academic & Career</Text>

      <SearchableSelectField
        label="University"
        placeholder="Search universities..."
        options={UNIVERSITIES_LIST}
        value={university}
        onChange={setUniversity}
      />

      <SearchableSelectField
        label="Majors"
        placeholder="Search majors..."
        options={MAJORS_LIST}
        isMulti
        value={majors}
        onChange={setMajors}
      />

      <SimplePicker
        label="Academic Status"
        placeholder="Select academic status"
        value={academicStatus}
        options={ACADEMIC_STATUS_OPTIONS}
        onChange={setAcademicStatus}
      />

      <TextInput
        placeholder="Desired Future Career"
        placeholderTextColor="#9a9a9a"
        value={desiredCareer}
        onChangeText={setDesiredCareer}
        style={fontStyle}
        className={inputClasses}
      />

      <Text className="text-sm text-brand-text mt-2" style={fontBoldStyle}>
        What are you looking for in a mentor?
      </Text>
      <TagChipGroup tags={MENTOR_SERVICES} value={desiredServices} onChange={setDesiredServices} />

      <TextInput
        placeholder="Anything else you'd like to share? (optional)"
        placeholderTextColor="#9a9a9a"
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
        multiline
        numberOfLines={4}
        style={fontStyle}
        className="bg-white rounded-lg px-4 py-3 text-base text-brand-text border border-brand-border min-h-[100px]"
        textAlignVertical="top"
      />

      <Pressable
        onPress={handleSave}
        disabled={submitting}
        className="h-[56px] bg-brand-button rounded-lg items-center justify-center mt-2 disabled:opacity-50"
        style={cardShadow}
      >
        <Text className="text-white text-lg" style={fontBoldStyle}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Text>
      </Pressable>

      <Text className="text-sm text-brand-text mt-4" style={fontBoldStyle}>Notification Preferences</Text>
      <View className="bg-white rounded-2xl border border-brand-cardBorder p-4 gap-4" style={cardShadow}>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm text-brand-text" style={fontBoldStyle}>Email Alerts</Text>
            <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
              Receipts for bookings and reschedules.
            </Text>
          </View>
          <Switch
            value={preferences.email}
            disabled={savingPrefs}
            onValueChange={(v) => handlePreferenceChange('email', v)}
            trackColor={{ true: '#007CA6' }}
          />
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm text-brand-text" style={fontBoldStyle}>SMS Alerts</Text>
            <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
              Reminders sent to your phone. Msg & data rates may apply.
            </Text>
          </View>
          <Switch
            value={preferences.sms}
            disabled={savingPrefs}
            onValueChange={(v) => handlePreferenceChange('sms', v)}
            trackColor={{ true: '#007CA6' }}
          />
        </View>

        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-sm text-brand-text" style={fontBoldStyle}>In-App Alerts</Text>
            <Text className="text-xs text-slate-500 mt-0.5" style={fontStyle}>
              Show updates in your notifications feed.
            </Text>
          </View>
          <Switch
            value={preferences.inApp}
            disabled={savingPrefs}
            onValueChange={(v) => handlePreferenceChange('inApp', v)}
            trackColor={{ true: '#007CA6' }}
          />
        </View>
      </View>

      <Text className="text-sm text-brand-text mt-4" style={fontBoldStyle}>Availability</Text>
      {user && (
        <AvailabilityCard
          initialSlots={user.manualAvailabilitySlots ?? []}
          title="My Availability"
          subtitle="Let mentors know when you're free to meet."
          onSave={handleAvailabilitySave}
        />
      )}
    </Screen>
  );
}
