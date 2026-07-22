import { useEffect, useState } from 'react';
import { Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { ToggleGroup } from '../../../components/onboarding/ToggleGroup';
import { SimplePicker } from '../../../components/onboarding/SimplePicker';
import { SearchableSelectField } from '../../../components/onboarding/SearchableSelectField';
import { TagChipGroup } from '../../../components/onboarding/TagChipGroup';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { Screen } from '../../../components/Screen';
import { STATES_LIST, MAJORS_LIST } from '../../../constants/lists';
import { MENTOR_SERVICES } from '../../../constants/services';
import { uploadResume } from '../../../lib/upload-api';
import { saveStep, loadStep } from '../../../lib/onboarding-storage';
import { formatPhoneNumber } from '../../../lib/format';

const REFERRAL_SOURCES = ['Social Media', 'Friend or Family', 'Other'];

type MentorStep1 = {
  resumePath: string;
  resumeName: string;
  gender: 'male' | 'female' | '';
  state: string;
  university: string;
  majors: string[];
  linkedinUrl: string;
  phone: string;
  referralSource: string;
  volunteeringFor: string[];
};

const EMPTY: MentorStep1 = {
  resumePath: '',
  resumeName: '',
  gender: '',
  state: '',
  university: '',
  majors: [],
  linkedinUrl: '',
  phone: '',
  referralSource: '',
  volunteeringFor: [],
};

const fontStyle = { fontFamily: 'Kollektif' };
const fontBoldStyle = { fontFamily: 'Kollektif-Bold' };
const inputClasses = 'h-[56px] bg-white rounded-lg px-4 text-base text-brand-text border border-brand-border';

export default function MentorProfileSetup() {
  const [formData, setFormData] = useState<MentorStep1>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStep<MentorStep1>('mentorStep1').then((saved) => {
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
        university: parsedData.university || prev.university,
        majors: parsedData.majors ? [parsedData.majors] : prev.majors,
      }));
      await saveStep('mentorResumeData', {
        jobTitle: parsedData.desiredCareer || '',
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
    if (formData.majors.length === 0) return setError('Please select at least one major.');
    if (!formData.state || !formData.university || !formData.phone || !formData.linkedinUrl) {
      return setError('Please fill in all required fields.');
    }
    await saveStep('mentorStep1', formData);
    router.push('/mentor/career-setup');
  };

  return (
    <Screen>
      <OnboardingHeader title="Mentor Profile — Step 1 of 3" />
      {error ? <Text className="text-brand-error" style={fontStyle}>{error}</Text> : null}

      <Pressable
        onPress={handlePickResume}
        disabled={uploading}
        className={`h-[56px] rounded-lg border items-center justify-center ${
          formData.resumePath ? 'border-brand-primary bg-brand-primary/10' : 'border-dashed border-brand-primary bg-white'
        }`}
      >
        {uploading ? (
          <ActivityIndicator color="#007CA6" />
        ) : (
          <Text className="text-brand-primary" style={fontBoldStyle}>
            {formData.resumePath ? '✓ Resume Uploaded' : 'Upload Resume (pdf, doc, docx, txt)'}
          </Text>
        )}
      </Pressable>

      <Text className="text-sm text-brand-text" style={fontBoldStyle}>Gender</Text>
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
        placeholder="University"
        placeholderTextColor="#9a9a9a"
        value={formData.university}
        onChangeText={(university) => setFormData((prev) => ({ ...prev, university }))}
        style={fontStyle}
        className={inputClasses}
      />

      <SearchableSelectField
        label="Majors"
        placeholder="Search majors..."
        options={MAJORS_LIST}
        isMulti
        value={formData.majors}
        onChange={(majors) => setFormData((prev) => ({ ...prev, majors }))}
      />

      <TextInput
        placeholder="LinkedIn URL"
        placeholderTextColor="#9a9a9a"
        autoCapitalize="none"
        value={formData.linkedinUrl}
        onChangeText={(linkedinUrl) => setFormData((prev) => ({ ...prev, linkedinUrl }))}
        style={fontStyle}
        className={inputClasses}
      />

      <TextInput
        placeholder="Phone"
        placeholderTextColor="#9a9a9a"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(phone) => setFormData((prev) => ({ ...prev, phone: formatPhoneNumber(phone) }))}
        style={fontStyle}
        className={inputClasses}
      />

      <SimplePicker
        label="How did you hear about us?"
        placeholder="Select an option"
        value={formData.referralSource}
        options={REFERRAL_SOURCES}
        onChange={(referralSource) => setFormData((prev) => ({ ...prev, referralSource }))}
      />

      <Text className="text-sm text-brand-text mt-2" style={fontBoldStyle}>
        Which services are you willing to offer?
      </Text>
      <TagChipGroup
        tags={MENTOR_SERVICES}
        value={formData.volunteeringFor}
        onChange={(volunteeringFor) => setFormData((prev) => ({ ...prev, volunteeringFor }))}
      />

      <Pressable
        onPress={handleNext}
        className="h-[56px] bg-brand-button rounded-lg items-center justify-center mt-4"
      >
        <Text className="text-white text-lg" style={fontBoldStyle}>Next</Text>
      </Pressable>
    </Screen>
  );
}
