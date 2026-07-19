import { useEffect, useState } from 'react';
import { Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SimplePicker } from '../../../components/onboarding/SimplePicker';
import { SearchableSelectField } from '../../../components/onboarding/SearchableSelectField';
import { TagChipGroup } from '../../../components/onboarding/TagChipGroup';
import { AvailabilityGrid } from '../../../components/onboarding/AvailabilityGrid';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { Screen } from '../../../components/Screen';
import { UNIVERSITIES_LIST, MAJORS_LIST } from '../../../constants/lists';
import { MENTOR_SERVICES } from '../../../constants/services';
import { uploadProfilePicture } from '../../../lib/upload-api';
import { loadStep, clearSteps } from '../../../lib/onboarding-storage';
import { createMenteeProfile, type AvailabilitySlot } from '../../../lib/onboarding-api';
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

type MenteeStep1 = {
  resumePath: string;
  gender: 'male' | 'female';
  state: string;
  phone: string;
  linkedinUrl: string;
  referralSource: string;
};

type MenteeResumeData = {
  university: string;
  majors: string[];
  desiredCareer: string;
};

const inputClasses = 'h-[56px] bg-white rounded-lg px-4 text-base text-brand-text border border-brand-border';

export default function MenteeAcademicSetup() {
  const { refreshUser } = useSession();
  const [university, setUniversity] = useState('');
  const [majors, setMajors] = useState<string[]>([]);
  const [academicStatus, setAcademicStatus] = useState('');
  const [desiredCareer, setDesiredCareer] = useState('');
  const [desiredServices, setDesiredServices] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [profilePicturePath, setProfilePicturePath] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStep<MenteeResumeData>('menteeResumeData').then((resumeData) => {
      if (!resumeData) return;
      if (resumeData.university) setUniversity(resumeData.university);
      if (resumeData.majors?.length) setMajors(resumeData.majors);
      if (resumeData.desiredCareer) setDesiredCareer(resumeData.desiredCareer);
    });
  }, []);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Photo library permission is required to upload a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploadingPhoto(true);
    setError('');
    try {
      const { filePath } = await uploadProfilePicture({
        uri: asset.uri,
        name: asset.fileName || 'profile.jpg',
        type: asset.mimeType || 'image/jpeg',
      });
      setProfilePicturePath(filePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile picture upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!university) return setError('Please select your university.');
    if (majors.length === 0) return setError('Please select at least one major.');
    if (!academicStatus) return setError('Please select your academic status.');
    if (!desiredCareer) return setError('Please enter your desired career.');

    const step1 = await loadStep<MenteeStep1>('menteeStep1');
    if (!step1) {
      return setError('Missing earlier onboarding steps — please start over from Step 1.');
    }

    setSubmitting(true);
    try {
      await createMenteeProfile({
        gender: step1.gender,
        phone: step1.phone,
        linkedinUrl: step1.linkedinUrl,
        referralSource: step1.referralSource,
        profilePicture: profilePicturePath || undefined,
        state: step1.state,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        additionalInfo,
        university,
        majors,
        calendarAccess: false,
        resume: step1.resumePath,
        academicStatus,
        desiredCareer,
        desiredServices,
        manualAvailabilitySlots: slots,
      });
      await clearSteps(['menteeStep1', 'menteeResumeData']);
      // Navigate straight to the dashboard rather than '/', which would
      // re-run (app)/index.tsx's redirect based on session `user` state —
      // that state update from refreshUser() isn't guaranteed to have landed
      // yet, which could bounce back into onboarding on a stale read.
      router.replace('/mentee-dashboard');
      refreshUser().catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <OnboardingHeader title="Mentee Academic — Step 2 of 2" />
      {error ? <Text className="text-brand-error">{error}</Text> : null}

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
        className={inputClasses}
      />

      <Text className="text-sm font-semibold text-brand-text mt-2">
        Which services are you looking for? (optional)
      </Text>
      <TagChipGroup tags={MENTOR_SERVICES} value={desiredServices} onChange={setDesiredServices} />

      <Pressable
        onPress={handlePickPhoto}
        disabled={uploadingPhoto}
        className="h-[56px] rounded-lg border border-dashed border-brand-primary items-center justify-center"
      >
        {uploadingPhoto ? (
          <ActivityIndicator color="#007CA6" />
        ) : (
          <Text className="text-brand-primary font-semibold">
            {profilePicturePath ? 'Photo uploaded ✓' : 'Upload Profile Picture (optional)'}
          </Text>
        )}
      </Pressable>

      <TextInput
        placeholder="Anything else you'd like to share? (optional)"
        placeholderTextColor="#9a9a9a"
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
        multiline
        numberOfLines={4}
        className="bg-white rounded-lg px-4 py-3 text-base text-brand-text border border-brand-border min-h-[100px]"
        textAlignVertical="top"
      />

      <Text className="text-sm font-semibold text-brand-text mt-2">Weekly Availability</Text>
      <AvailabilityGrid onChange={setSlots} />

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        className="h-[56px] bg-brand-button rounded-lg items-center justify-center mt-4 disabled:opacity-50"
      >
        <Text className="text-white text-lg font-bold">
          {submitting ? 'Saving...' : 'Finish Setup'}
        </Text>
      </Pressable>
    </Screen>
  );
}
