import { useState } from 'react';
import { Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SimplePicker } from '../../../components/onboarding/SimplePicker';
import { AvailabilityGrid } from '../../../components/onboarding/AvailabilityGrid';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { Screen } from '../../../components/Screen';
import { uploadProfilePicture } from '../../../lib/upload-api';
import { loadStep, clearSteps } from '../../../lib/onboarding-storage';
import { createMentorProfile, type AvailabilitySlot } from '../../../lib/onboarding-api';
import { useSession } from '../../../lib/session-context';

const FREQUENCY_OPTIONS = ['Weekly', 'Biweekly', 'Monthly'];

type MentorStep1 = {
  resumePath: string;
  gender: 'male' | 'female';
  state: string;
  university: string;
  majors: string[];
  linkedinUrl: string;
  phone: string;
  referralSource: string;
  volunteeringFor: string[];
};

type MentorStep2 = {
  jobTitle: string;
  employer: string;
  industry: string;
  yearsOfProfExp: string;
  additionalInfo: string;
};

const inputClasses = 'h-[56px] bg-white rounded-lg px-4 text-base text-brand-text border border-brand-border';

export default function MentorAvailabilitySetup() {
  const { refreshUser } = useSession();
  const [profilePicturePath, setProfilePicturePath] = useState('');
  const [frequency, setFrequency] = useState('');
  const [customMeetingLink, setCustomMeetingLink] = useState('');
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    if (customMeetingLink) {
      try {
        const url = new URL(customMeetingLink);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
      } catch {
        return setError('Custom meeting link must be a valid http/https URL.');
      }
    }

    const step1 = await loadStep<MentorStep1>('mentorStep1');
    const step2 = await loadStep<MentorStep2>('mentorStep2');
    if (!step1 || !step2) {
      return setError('Missing earlier onboarding steps — please start over from Step 1.');
    }

    setSubmitting(true);
    try {
      await createMentorProfile({
        gender: step1.gender,
        phone: step1.phone,
        linkedinUrl: step1.linkedinUrl,
        referralSource: step1.referralSource,
        profilePicture: profilePicturePath || undefined,
        state: step1.state,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        additionalInfo: step2.additionalInfo,
        university: step1.university,
        majors: step1.majors,
        calendarAccess: false,
        resume: step1.resumePath,
        jobTitle: step2.jobTitle,
        employer: step2.employer,
        industry: step2.industry,
        yearsOfProfExp: Number(step2.yearsOfProfExp) || 0,
        frequency,
        volunteeringFor: step1.volunteeringFor,
        customMeetingLink: customMeetingLink || undefined,
        manualAvailabilitySlots: slots,
      });
      await clearSteps(['mentorStep1', 'mentorStep2', 'mentorResumeData']);
      // Navigate straight to the dashboard rather than '/', which would
      // re-run (app)/index.tsx's redirect based on session `user` state —
      // that state update from refreshUser() isn't guaranteed to have landed
      // yet, which could bounce back into onboarding on a stale read.
      router.replace('/mentor-dashboard');
      refreshUser().catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <OnboardingHeader title="Mentor Availability — Step 3 of 3" />
      {error ? <Text className="text-brand-error">{error}</Text> : null}

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

      <SimplePicker
        label="How often would you like to meet mentees?"
        placeholder="Select frequency"
        value={frequency}
        options={FREQUENCY_OPTIONS}
        onChange={setFrequency}
      />

      <TextInput
        placeholder="Custom Meeting Link (optional)"
        placeholderTextColor="#9a9a9a"
        autoCapitalize="none"
        value={customMeetingLink}
        onChangeText={setCustomMeetingLink}
        className={inputClasses}
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
