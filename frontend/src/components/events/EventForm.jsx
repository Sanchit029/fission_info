import { useState } from 'react';
import { FiImage, FiX, FiLoader, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api';

const categories = [
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'concert', label: 'Concert' },
  { value: 'sports', label: 'Sports' },
  { value: 'party', label: 'Party' },
  { value: 'other', label: 'Other' },
];

const EventForm = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    time: initialData?.time || '',
    location: initialData?.location || '',
    capacity: initialData?.capacity || '',
    category: initialData?.category || 'other',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [errors, setErrors] = useState({});
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    
    // Check if date is in the future
    if (formData.date && new Date(formData.date) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.date = 'Date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });
    
    if (image) {
      submitData.append('image', image);
    }

    onSubmit(submitData);
  };

  const generateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title first');
      return;
    }

    setGeneratingAI(true);
    try {
      const { data } = await aiAPI.generateDescription({
        title: formData.title,
        category: formData.category,
        location: formData.location,
      });
      setFormData((prev) => ({ ...prev, description: data.description }));
      toast.success('Description generated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate description');
    } finally {
      setGeneratingAI(false);
    }
  };

  const enhanceDescription = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a description first');
      return;
    }

    setGeneratingAI(true);
    try {
      const { data } = await aiAPI.enhanceDescription({
        title: formData.title,
        description: formData.description,
      });
      setFormData((prev) => ({ ...prev, description: data.description }));
      toast.success('Description enhanced!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enhance description');
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="label">
          Event Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter event title"
          className={`input ${errors.title ? 'input-error' : ''}`}
          maxLength={100}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Description with AI */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="description" className="label mb-0">
            Description <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={generateDescription}
              disabled={generatingAI}
              className="text-xs flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
            >
              {generatingAI ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
              <span>Generate with AI</span>
            </button>
            <button
              type="button"
              onClick={enhanceDescription}
              disabled={generatingAI}
              className="text-xs flex items-center space-x-1 text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
            >
              {generatingAI ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
              <span>Enhance</span>
            </button>
          </div>
        </div>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your event..."
          rows={5}
          className={`input resize-none ${errors.description ? 'input-error' : ''}`}
          maxLength={2000}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-sm text-red-500">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-500">{formData.description.length}/2000</span>
        </div>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="label">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`input ${errors.date ? 'input-error' : ''}`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="time" className="label">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`input ${errors.time ? 'input-error' : ''}`}
          />
          {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="label">
          Location <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Event location or address"
          className={`input ${errors.location ? 'input-error' : ''}`}
          maxLength={200}
        />
        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
      </div>

      {/* Capacity and Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="capacity" className="label">
            Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            placeholder="Maximum attendees"
            min="1"
            className={`input ${errors.capacity ? 'input-error' : ''}`}
          />
          {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
        </div>
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="label">Event Image</label>
        {imagePreview ? (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Event preview"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FiImage className="w-10 h-10 text-gray-400 mb-3" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary px-8 py-3"
        >
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>{initialData ? 'Update Event' : 'Create Event'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
