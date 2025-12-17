import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiMapPin, FiArrowRight, FiStar, FiShield, FiZap } from 'react-icons/fi';
import { useAuthStore } from '../store/authStore';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: FiCalendar,
      title: 'Easy Event Creation',
      description: 'Create and manage events in minutes with our intuitive interface and AI-powered description generation.',
    },
    {
      icon: FiUsers,
      title: 'Smart RSVP System',
      description: 'Never worry about overbooking. Our system handles capacity management and concurrent registrations.',
    },
    {
      icon: FiMapPin,
      title: 'Discover Events',
      description: 'Find amazing events near you with powerful search and filtering capabilities.',
    },
    {
      icon: FiShield,
      title: 'Secure & Reliable',
      description: 'JWT authentication and robust backend ensure your data is always protected.',
    },
    {
      icon: FiZap,
      title: 'AI-Powered',
      description: 'Let AI help you create compelling event descriptions that attract more attendees.',
    },
    {
      icon: FiStar,
      title: 'User Dashboard',
      description: 'Track your created events and RSVPs all in one convenient dashboard.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="container-custom relative py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discover & Create
              <span className="block text-primary-200">Amazing Events</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8 max-w-2xl">
              Connect with people who share your interests. Create memorable experiences, 
              manage RSVPs, and build your community with Eventify.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/events" 
                className="btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
              >
                Explore Events
              </Link>
              {!isAuthenticated && (
                <Link 
                  to="/register" 
                  className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
                >
                  Get Started Free
                </Link>
              )}
              {isAuthenticated && (
                <Link 
                  to="/create-event" 
                  className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
                >
                  Create Event
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Host Events
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From creation to management, Eventify provides all the tools you need 
              to make your events successful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 lg:p-16 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Host Your Event?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of event organizers who trust Eventify to bring their 
              events to life. Start creating unforgettable experiences today.
            </p>
            <Link 
              to={isAuthenticated ? "/create-event" : "/register"}
              className="inline-flex items-center space-x-2 btn bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              <span>{isAuthenticated ? 'Create Your Event' : 'Get Started Free'}</span>
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">1000+</p>
              <p className="text-gray-600 dark:text-gray-400">Events Created</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">5000+</p>
              <p className="text-gray-600 dark:text-gray-400">Happy Attendees</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">500+</p>
              <p className="text-gray-600 dark:text-gray-400">Event Organizers</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">99%</p>
              <p className="text-gray-600 dark:text-gray-400">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
