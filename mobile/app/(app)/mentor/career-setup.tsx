import { useEffect, useState } from 'react';
import { Text, TextInput, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SearchableSelectField } from '../../../components/onboarding/SearchableSelectField';
import { OnboardingHeader } from '../../../components/onboarding/OnboardingHeader';
import { Screen } from '../../../components/Screen';
import { INDUSTRIES_LIST } from '../../../constants/lists';
import { saveStep, loadStep } from '../../../lib/onboarding-storage';

type MentorStep2 = {
  jobTitle: string;
  employer: string;
  industry: string;
  yearsOfProfExp: string;
  additionalInfo: string;
};

const EMPTY: MentorStep2 = { jobTitle: '', employer: '', industry: '', yearsOfProfExp: '', additionalInfo: '' };

const inputClasses = 'h-[56px] bg-white rounded-lg px-4 text-base text-brand-text border border-brand-border';

export default function MentorCareerSetup() {
  const [formData, setFormData] = useState<MentorStep2>(EMPTY);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await loadStep<MentorStep2>('mentorStep2');
      if (saved) {
        setFormData(saved);
        return;
      }
      const resumeData = await loadStep<{ jobTitle: string }>('mentorResumeData');
      if (resumeData?.jobTitle) {
        setFormData((prev) => ({ ...prev, jobTitle: resumeData.jobTitle }));
      }
    })();
  }, []);

  const handleNext = async () => {
    setError('');
    if (!formData.jobTitle || !formData.employer || !formData.industry || !formData.yearsOfProfExp) {
      return setError('Please fill in all required fields.');
    }
    await saveStep('mentorStep2', formData);
    router.push('/mentor/availability-setup');
  };

  return (
    <Screen>
      <OnboardingHeader title="Mentor Career — Step 2 of 3" />
      {error ? <Text className="text-brand-error">{error}</Text> : null}

      <TextInput
        placeholder="Job Title"
        placeholderTextColor="#9a9a9a"
        value={formData.jobTitle}
        onChangeText={(jobTitle) => setFormData((prev) => ({ ...prev, jobTitle }))}
        className={inputClasses}
      />

      <TextInput
        placeholder="Employer"
        placeholderTextColor="#9a9a9a"
        value={formData.employer}
        onChangeText={(employer) => setFormData((prev) => ({ ...prev, employer }))}
        className={inputClasses}
      />

      <SearchableSelectField
        label="Industry"
        placeholder="Search industry..."
        options={INDUSTRIES_LIST}
        value={formData.industry}
        onChange={(industry) => setFormData((prev) => ({ ...prev, industry }))}
      />

      <TextInput
        placeholder="Years of Professional Experience"
        placeholderTextColor="#9a9a9a"
        keyboardType="number-pad"
        value={formData.yearsOfProfExp}
        onChangeText={(yearsOfProfExp) => setFormData((prev) => ({ ...prev, yearsOfProfExp }))}
        className={inputClasses}
      />

      <TextInput
        placeholder="Anything else you'd like to share? (optional)"
        placeholderTextColor="#9a9a9a"
        value={formData.additionalInfo}
        onChangeText={(additionalInfo) => setFormData((prev) => ({ ...prev, additionalInfo }))}
        multiline
        numberOfLines={4}
        className="bg-white rounded-lg px-4 py-3 text-base text-brand-text border border-brand-border min-h-[100px]"
        textAlignVertical="top"
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
