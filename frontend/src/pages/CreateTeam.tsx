import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Users } from 'lucide-react';
import { useTeamStore } from '../store';
import { SPORT_TYPES } from '@teambudget/shared';

export default function CreateTeam() {
  const navigate = useNavigate();
  const { createTeam, isLoading } = useTeamStore();

  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    season: '',
    ageGroup: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createTeam(formData);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create team');
    }
  };

  // Generate season options (current year and next year)
  const currentYear = new Date().getFullYear();
  const seasonOptions = [
    `Spring ${currentYear}`,
    `Summer ${currentYear}`,
    `Fall ${currentYear}`,
    `Winter ${currentYear}`,
    `Spring ${currentYear + 1}`,
    `Summer ${currentYear + 1}`,
    `Fall ${currentYear + 1}`,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Users size={32} className="text-primary-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Create Your Team</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Set up your team to start tracking finances
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="label">
                Team Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Lincoln Soccer Club U12"
              />
            </div>

            <div>
              <label htmlFor="sport" className="label">
                Sport
              </label>
              <select
                id="sport"
                name="sport"
                required
                value={formData.sport}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select a sport</option>
                {SPORT_TYPES.map((sport) => (
                  <option key={sport.value} value={sport.value}>
                    {sport.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="season" className="label">
                Season
              </label>
              <select
                id="season"
                name="season"
                required
                value={formData.season}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select a season</option>
                {seasonOptions.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ageGroup" className="label">
                Age Group (optional)
              </label>
              <input
                id="ageGroup"
                name="ageGroup"
                type="text"
                value={formData.ageGroup}
                onChange={handleChange}
                className="input"
                placeholder="e.g., U12, Varsity, Adult"
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full btn-primary py-3">
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Creating team...
                </>
              ) : (
                'Create Team'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
