import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCalendar, FiUsers, FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { eventsAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('created');
  const [createdEvents, setCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    setLoading(true);
    try {
      const [createdRes, attendingRes] = await Promise.all([
        eventsAPI.getUserCreated(),
        eventsAPI.getUserAttending(),
      ]);
      setCreatedEvents(createdRes.data);
      setAttendingEvents(attendingRes.data);
    } catch (error) {
      console.error('Error fetching user events:', error);
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setDeleteLoading(eventId);
    try {
      await eventsAPI.delete(eventId);
      setCreatedEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCancelRsvp = async (eventId) => {
    try {
      await eventsAPI.cancelRsvp(eventId);
      setAttendingEvents((prev) => prev.filter((e) => e._id !== eventId));
      toast.success('RSVP cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel RSVP');
    }
  };

  const EventRow = ({ event, isCreated }) => {
    const isPast = new Date(event.date) < new Date().setHours(0, 0, 0, 0);
    
    return (
      <div className={`card p-4 md:p-6 ${isPast ? 'opacity-60' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Image */}
          <div className="w-full md:w-24 h-40 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                <FiCalendar className="w-8 h-8 text-white/50" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-grow min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <Link 
                  to={`/events/${event._id}`}
                  className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {format(new Date(event.date), 'EEE, MMM d, yyyy')} at {event.time}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  isPast 
                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {isPast ? 'Past' : 'Upcoming'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <FiUsers className="w-4 h-4" />
                <span>{event.attendees?.length || 0} / {event.capacity}</span>
              </span>
              <span className="capitalize">{event.category}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            {isCreated ? (
              <>
                <Link
                  to={`/events/${event._id}/edit`}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiEdit2 className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(event._id)}
                  disabled={deleteLoading === event._id}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                >
                  {deleteLoading === event._id ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiTrash2 className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleCancelRsvp(event._id)}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Cancel RSVP
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              My Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name}!
            </p>
          </div>
          <Link to="/create-event" className="btn-primary px-6 py-3">
            <FiPlus className="w-5 h-5 mr-2" />
            Create Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {createdEvents.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Events Created</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendingEvents.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Events Attending</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {createdEvents.reduce((acc, e) => acc + (e.attendees?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Attendees</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {createdEvents.filter(e => new Date(e.date) >= new Date().setHours(0,0,0,0)).length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('created')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'created'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Created Events ({createdEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('attending')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'attending'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Attending ({attendingEvents.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : activeTab === 'created' ? (
          createdEvents.length === 0 ? (
            <EmptyState
              title="No events created yet"
              description="Start creating amazing events and bring people together!"
              actionLabel="Create Your First Event"
              actionLink="/create-event"
            />
          ) : (
            <div className="space-y-4">
              {createdEvents.map((event) => (
                <EventRow key={event._id} event={event} isCreated />
              ))}
            </div>
          )
        ) : attendingEvents.length === 0 ? (
          <EmptyState
            title="Not attending any events"
            description="Explore events and RSVP to start building your schedule!"
            actionLabel="Explore Events"
            actionLink="/events"
          />
        ) : (
          <div className="space-y-4">
            {attendingEvents.map((event) => (
              <EventRow key={event._id} event={event} isCreated={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
