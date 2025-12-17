import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiUsers, FiClock } from 'react-icons/fi';

const EventCard = ({ event }) => {
  const {
    _id,
    title,
    description,
    date,
    time,
    location,
    capacity,
    attendees = [],
    image,
    category,
    creator,
  } = event;

  const availableSpots = capacity - attendees.length;
  const isFull = availableSpots <= 0;
  const isAlmostFull = availableSpots > 0 && availableSpots <= 5;

  const categoryColors = {
    conference: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    workshop: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    meetup: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    concert: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    sports: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    party: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <Link to={`/events/${_id}`} className="block">
      <div className="card overflow-hidden h-full flex flex-col group">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
              <FiCalendar className="w-16 h-16 text-white/50" />
            </div>
          )}
          
          {/* Category Badge */}
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[category] || categoryColors.other}`}>
            {category}
          </span>

          {/* Capacity Badge */}
          {isFull ? (
            <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              Sold Out
            </span>
          ) : isAlmostFull ? (
            <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              {availableSpots} spots left
            </span>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
            {description}
          </p>

          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <FiCalendar className="w-4 h-4 flex-shrink-0" />
              <span>{format(new Date(date), 'EEE, MMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FiClock className="w-4 h-4 flex-shrink-0" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FiMapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <FiUsers className="w-4 h-4 flex-shrink-0" />
              <span>{attendees.length} / {capacity} attendees</span>
            </div>
          </div>

          {/* Creator */}
          {creator && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                  {creator.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                By {creator.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
