import { useEffect, useState } from 'react';
import { Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { ToggleGroup } from '../../../components/onboarding/ToggleGroup';
import { SimplePicker } from '../../../components/onboarding/SimplePicker';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { Screen } from '../../../components/Screen';
import { STATES_LIST } from '../../../constants/lists';
import { uploadResume } from '../../../lib/upload-api';
import { saveStep, loadStep } from '../../../lib/onboarding-storage';
import { formatPhoneNumber } from '../../../lib/format';

const REFERRAL_SOURCES = ['Social Media', 'Friend or Family', 'Other'];

type MenteeStep1 = {
  resumePath: string;
  resumeName: string;
  gender: 'male' | 'female' | '';
  state: string;
  phone: string;
  linkedinUrl: string;
  referralSource: string;
};

const EMPTY: MenteeStep1 = {
  resumePath: '',
  resumeName: '',
  gender: '',
  state: '',
  phone: '',
  linkedinUrl: '',
  referralSource: '',
};

const inputClasses = 'h-[56px] bg-white rounded-lg px-4 text-base text-brand-text border border-brand-border';

export default function MenteeProfileSetup() {
  const [formData, setFormData] = useState<MenteeStep1>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStep<MenteeStep1>('menteeStep1').then((saved) => {
      if (saved) setFormData(saved);
    });
  }, []);

  const handlePickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    setError('');
    try {
      const { filePath, parsedData } = await uploadResume({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      });
      setFormData((prev) => ({
        ...prev,
        resumePath: filePath,
        resumeName: asset.name,
        phone: parsedData.phone ? formatPhoneNumber(parsedData.phone) : prev.phone,
        linkedinUrl: parsedData.linkedinUrl || prev.linkedinUrl,
      }));
      await saveStep('menteeResumeData', {
        university: parsedData.university || '',
        majors: parsedData.majors ? [parsedData.majors] : [],
        desiredCareer: parsedData.desiredCareer || '',
        resumePath: filePath,
        resumeName: asset.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    setError('');
    if (!formData.resumePath) return setError('Please upload your resume.');
    if (!formData.gender) return setError('Please select your gender.');
    if (!formData.referralSource) return setError('Please tell us how you heard about us.');
    if (!formData.state || !formData.phone) {
      return setError('Please fill in all required fields.');
    }
    await saveStep('menteeStep1', formData);
    router.push('/mentee/academic-setup');
  };

  return (
    <Screen>
      <OnboardingHeader title="Mentee Profile — Step 1 of 2" />
      {error ? <Text className="text-brand-error">{error}</Text> : null}

      <Pressable
        onPress={handlePickResume}
        disabled={uploading}
        className="h-[56px] rounded-lg border border-dashed border-brand-primary items-center justify-center"
      >
        {uploading ? (
          <ActivityIndicator color="#007CA6" />
        ) : (
          <Text className="text-brand-primary font-semibold">
            {formData.resumeName || 'Upload Resume (pdf, doc, docx, txt)'}
          </Text>
        )}
      </Pressable>

      <Text className="text-sm font-semibold text-brand-text">Gender</Text>
      <ToggleGroup
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]}
        value={formData.gender || null}
        onChange={(gender) => setFormData((prev) => ({ ...prev, gender }))}
      />

      <SimplePicker
        label="State"
        placeholder="Select state"
        value={formData.state}
        options={STATES_LIST}
        onChange={(state) => setFormData((prev) => ({ ...prev, state }))}
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#9a9a9a"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(phone) => setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(phone) }))}
        className={inputClasses}
      />

      <TextInput
        placeholder="LinkedIn URL (optional)"
        placeholderTextColor="#9a9a9a"
        autoCapitalize="none"
        value={formData.linkedinUrl}
        onChangeText={(linkedinUrl) => setFormData((prev) => ({ ...prev, linkedinUrl }))}
        className={inputClasses}
      />

      <SimplePicker
        label="How did you hear about us?"
        placeholder="Select an option"
        value={formData.referralSource}
        options={REFERRAL_SOURCES}
        onChange={(referralSource) => setFormData((prev) => ({ ...prev, referralSource }))}
      />

      <Pressable
        onPress={handleNext}
        className="h-[56px] bg-brand-button rounded-lg items-center justify-center mt-4"
      >
        <Text className="text-white text-lg font-bold">Next</Text>
      </Pressable>
    </Screen>
  );
}
