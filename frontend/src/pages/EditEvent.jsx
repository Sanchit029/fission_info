import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import EventForm from '../components/events/EventForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { eventsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventsAPI.getOne(id);
      
      // Check if user is the creator
      if (data.creator._id !== user._id) {
        toast.error('You are not authorized to edit this event');
        navigate(`/events/${id}`);
        return;
      }
      
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await eventsAPI.update(id, formData);
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error) {
      console.error('Update event error:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchEvent} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom max-w-3xl">
        {/* Back Button */}
        <Link 
          to={`/events/${id}`} 
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Event</span>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Edit Event
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Update your event details
          </p>
        </div>

        {/* Form */}
        <div className="card p-6 md:p-8">
          <EventForm 
            initialData={event} 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting} 
          />
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
