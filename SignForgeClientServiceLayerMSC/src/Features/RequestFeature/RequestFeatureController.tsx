import React, { useState, useCallback } from 'react';
import RequestFeatureCON from './Constants/RequestFeatureCON';
import { FeatureRequestResponseModel } from './Models/RequestFeatureModel';
import RequestFeatureService from './Services/RequestFeatureService';
import RequestFeatureStaticComponent from './Components/static/RequestFeatureStaticComponent';
import ApplicationHapticsUtility from '../../Utilities/ApplicationHapticsUtility';
import useAuthenticationStateStore from '../../Store/AuthenticationStateStore';

export default function RequestFeatureController(): React.JSX.Element {
  const currentUser = useAuthenticationStateStore((state) => state.user);

  const [title, setTitle] = useState<string>('');
  const [featureType, setFeatureType] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    featureType?: string;
    description?: string;
  }>({});
  const [submittedRequest, setSubmittedRequest] = useState<FeatureRequestResponseModel | null>(null);

  const handleChangeTitle = useCallback((val: string) => {
    setTitle(val);
    setValidationErrors((prev) => ({ ...prev, title: undefined }));
  }, []);

  const handleChangeFeatureType = useCallback((val: string) => {
    setFeatureType(val);
    setValidationErrors((prev) => ({ ...prev, featureType: undefined }));
  }, []);

  const handleChangeDescription = useCallback((val: string) => {
    setDescription(val);
    setValidationErrors((prev) => ({ ...prev, description: undefined }));
  }, []);

  const validateForm = (): boolean => {
    const errors: { title?: string; featureType?: string; description?: string } = {};

    if (!title.trim()) {
      errors.title = 'Feature title is required.';
    } else if (title.trim().length < RequestFeatureCON.MIN_TITLE_LENGTH) {
      errors.title = `Feature title must be at least ${RequestFeatureCON.MIN_TITLE_LENGTH} characters.`;
    }

    if (!featureType.trim()) {
      errors.featureType = 'Please select a feature category.';
    }

    if (!description.trim()) {
      errors.description = 'Feature description is required.';
    } else if (description.trim().length < RequestFeatureCON.MIN_DESCRIPTION_LENGTH) {
      errors.description = `Feature description must be at least ${RequestFeatureCON.MIN_DESCRIPTION_LENGTH} characters.`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      ApplicationHapticsUtility.current.triggerHapticFeedback(20);
      return;
    }

    try {
      setIsSubmitting(true);
      ApplicationHapticsUtility.current.triggerHapticFeedback(15);

      const response = await RequestFeatureService.current.submitFeatureRequest({
        title: title.trim(),
        featureType: featureType.trim(),
        description: description.trim(),
      });

      ApplicationHapticsUtility.current.triggerHapticFeedback(30);
      setSubmittedRequest(response);
    } catch (error: any) {
      console.error('Error submitting feature request:', error);
      alert(error.message || 'An error occurred while submitting your proposal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    ApplicationHapticsUtility.current.triggerHapticFeedback(12);
    setTitle('');
    setFeatureType('');
    setDescription('');
    setValidationErrors({});
    setSubmittedRequest(null);
  }, []);

  return (
    <RequestFeatureStaticComponent
      currentUser={currentUser}
      title={title}
      featureType={featureType}
      description={description}
      isSubmitting={isSubmitting}
      validationErrors={validationErrors}
      submittedRequest={submittedRequest}
      onChangeTitle={handleChangeTitle}
      onChangeFeatureType={handleChangeFeatureType}
      onChangeDescription={handleChangeDescription}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  );
}
