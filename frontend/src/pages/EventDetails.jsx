import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiEdit2, 
  FiTrash2, FiArrowLeft, FiShare2, FiCheck, FiX, FiLoader 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { eventsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventsAPI.getOne(id);
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err.response?.data?.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const isCreator = user && event?.creator?._id === user._id;
  const isAttending = user && event?.attendees?.some((a) => a._id === user._id);
  const isFull = event && event.attendees?.length >= event.capacity;
  const availableSpots = event ? event.capacity - event.attendees?.length : 0;
  const isPastEvent = event && new Date(event.date) < new Date().setHours(0, 0, 0, 0);

  const handleRsvp = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    setRsvpLoading(true);
    try {
      if (isAttending) {
        await eventsAPI.cancelRsvp(id);
        toast.success('RSVP cancelled');
      } else {
        await eventsAPI.rsvp(id);
        toast.success('Successfully RSVPed!');
      }
      fetchEvent();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await eventsAPI.delete(id);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } catch {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const categoryColors = {
    conference: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    workshop: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    meetup: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    concert: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    party: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorMessage message={error} onRetry={fetchEvent} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom">
        {/* Back Button */}
        <Link 
          to="/events" 
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span>Back to Events</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 mb-6">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-96 flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                  <FiCalendar className="w-24 h-24 text-white/50" />
                </div>
              )}
              
              {/* Category Badge */}
              <span className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium capitalize ${categoryColors[event.category] || categoryColors.other}`}>
                {event.category}
              </span>

              {isPastEvent && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">Event Ended</span>
                </div>
              )}
            </div>

            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {event.title}
              </h1>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiShare2 className="w-5 h-5" />
                </button>
                
                {isCreator && (
                  <>
                    <Link
                      to={`/events/${id}/edit`}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Event Info */}
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Event Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FiCalendar className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiClock className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.time}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.location}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FiUsers className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.attendees?.length} / {event.capacity} attendees
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isFull ? 'Event is full' : `${availableSpots} spots remaining`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                About This Event
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Organizer */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Organizer
              </h2>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.creator?.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.creator?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Registration
              </h2>

              {/* Capacity Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Capacity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {event.attendees?.length} / {event.capacity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isFull ? 'bg-red-500' : 'bg-primary-600'
                    }`}
                    style={{
                      width: `${(event.attendees?.length / event.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* RSVP Button */}
              {!isPastEvent && !isCreator && (
                <button
                  onClick={handleRsvp}
                  disabled={rsvpLoading || (isFull && !isAttending)}
                  className={`w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${
                    isAttending
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                      : isFull
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-800'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {rsvpLoading ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : isAttending ? (
                    <>
                      <FiCheck className="w-5 h-5" />
                      <span>You're Going!</span>
                    </>
                  ) : isFull ? (
                    <span>Event is Full</span>
                  ) : (
                    <span>RSVP Now</span>
                  )}
                </button>
              )}

              {isAttending && !isPastEvent && (
                <button
                  onClick={handleRsvp}
                  disabled={rsvpLoading}
                  className="w-full mt-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  Cancel RSVP
                </button>
              )}

              {isCreator && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  You are the organizer of this event
                </p>
              )}

              {isPastEvent && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  This event has already ended
                </p>
              )}

              {/* Attendees Preview */}
              {event.attendees?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Attendees ({event.attendees.length})
                  </h3>
                  <div className="flex -space-x-2 overflow-hidden">
                    {event.attendees.slice(0, 8).map((attendee, index) => (
                      <div
                        key={attendee._id}
                        className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800"
                        title={attendee.name}
                      >
                        <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                          {attendee.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {event.attendees.length > 8 && (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{event.attendees.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Delete Event
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="btn-danger px-4 py-2 flex items-center space-x-2"
              >
                {deleteLoading ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
