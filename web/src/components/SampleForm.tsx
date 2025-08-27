import React from 'react';
import { useForm, SubmitHandler, FieldError } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

const today = new Date();
today.setHours(0, 0, 0, 0);

const sampleSchema = z.object({
  sampleId: z
    .string()
    .min(1, 'Sample ID is required')
    .regex(/^[A-Z]-\d{3,5}$/, 'Invalid Sample ID format (e.g., A-123)'),
  collectionDate: z
    .string()
    .min(1, 'Collection date is required')
    .refine((dateString) => new Date(dateString) <= today, {
      message: 'Collection date cannot be in the future',
    }),
  sampleType: z.enum(['blood', 'saliva', 'tissue'], {
    errorMap: () => ({ message: 'Please select a sample type' }),
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a priority' }),
  }),
});

type SampleFormInputs = z.infer<typeof sampleSchema>;

const mapServerErrorsToForm = (
  errorData: any,
  setErrors: (field: keyof SampleFormInputs, error: FieldError) => void
) => {
  if (errorData?.errors) {
    Object.keys(errorData.errors).forEach((key) => {
      const field = key as keyof SampleFormInputs;
      setErrors(field, {
        type: 'server',
        message: errorData.errors[key].message,
      });
    });
  }
};

export const SampleForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SampleFormInputs>({
    resolver: zodResolver(sampleSchema),
    mode: 'onChange',
  });

  const onSubmit: SubmitHandler<SampleFormInputs> = async (data) => {
    try {
      const response = await axios.post('/api/samples', data);
      console.log('Submission successful:', response.data);
      alert('Sample submitted successfully!');
      reset();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error('Submission failed:', error.response.data);
        mapServerErrorsToForm(error.response.data, setError);
      } else {
        console.error('An unexpected error occurred:', error);
        setError('root', {
          type: 'submit',
          message: 'An unexpected error occurred. Please try again.',
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto p-4 space-y-4 text-gray-800"
      aria-label="Sample Submission Form"
    >
      <div>
        <label htmlFor="sampleId" className="block text-sm font-medium">
          Sample ID
        </label>
        <div id="sampleId-description" className="text-xs text-gray-400 mt-1">
          Must be in the format of a capital letter, a hyphen, and 3-5 digits (e.g., A-123).
        </div>
        <input
          id="sampleId"
          {...register('sampleId')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500"
          aria-invalid={errors.sampleId ? 'true' : 'false'}
          aria-describedby="sampleId-description"
        />
        {errors.sampleId && (
          <p className="mt-1 text-sm text-red-600" role="alert" id="sampleId-error">
            {errors.sampleId.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="collectionDate" className="block text-sm font-medium">
          Collection Date
        </label>
        <div id="collectionDate-description" className="text-xs text-gray-400 mt-1">
          Enter the date the sample was collected. This cannot be a future date.
        </div>
        <input
          id="collectionDate"
          type="date"
          {...register('collectionDate')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500"
          aria-invalid={errors.collectionDate ? 'true' : 'false'}
          aria-describedby="collectionDate-description"
        />
        {errors.collectionDate && (
          <p className="mt-1 text-sm text-red-600" role="alert" id="collectionDate-error">
            {errors.collectionDate.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="sampleType" className="block text-sm font-medium">
          Sample Type
        </label>
        <div id="sampleType-description" className="text-xs text-gray-400 mt-1">
          Select the biological source of the sample.
        </div>
        <select
          id="sampleType"
          {...register('sampleType')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500"
          aria-invalid={errors.sampleType ? 'true' : 'false'}
          aria-describedby="sampleType-description"
        >
          <option value="">-- Select a type --</option>
          <option value="blood">Blood</option>
          <option value="saliva">Saliva</option>
          <option value="tissue">Tissue</option>
        </select>
        {errors.sampleType && (
          <p className="mt-1 text-sm text-red-600" role="alert" id="sampleType-error">
            {errors.sampleType.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="priority" className="block text-sm font-medium">
          Priority
        </label>
        <div id="priority-description" className="text-xs text-gray-400 mt-1">
          Indicate the urgency of processing the sample.
        </div>
        <select
          id="priority"
          {...register('priority')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring focus:ring-opacity-50 focus:ring-blue-500 focus:border-blue-500"
          aria-invalid={errors.priority ? 'true' : 'false'}
          aria-describedby="priority-description"
        >
          <option value="">-- Select a priority --</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        {errors.priority && (
          <p className="mt-1 text-sm text-red-600" role="alert" id="priority-error">
            {errors.priority.message}
          </p>
        )}
      </div>

      {errors.root && (
        <p className="mt-2 text-sm text-red-600 text-center" role="alert">
          {errors.root.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};