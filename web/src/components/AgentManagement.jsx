import { useEffect, useState } from "react";

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    countryCode: "+1",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/agents", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAgents(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch agents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create agent");
      }

      setSuccess("Agent created successfully");
      setFormData({
        name: "",
        email: "",
        password: "",
        mobileNumber: "",
        countryCode: "+1",
      });
      fetchAgents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/agents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete agent");
      }

      setSuccess("Agent deleted successfully");
      fetchAgents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <h2 className="text-2xl font-bold mb-4">Agent Management</h2>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4 text-sm">
          {success}
        </div>
      )}

      {/* Add Agent Form */}
      <div className="bg-white shadow rounded-lg p-4 mb-8">
        <h3 className="text-lg font-semibold mb-4">Add New Agent</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border rounded-md p-2"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border rounded-md p-2"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full border rounded-md p-2"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex">
                <input
                  type="text"
                  name="countryCode"
                  className="w-16 border rounded-l-md p-2"
                  value={formData.countryCode}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="mobileNumber"
                  required
                  className="flex-grow border rounded-r-md p-2"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition"
          >
            {isLoading ? "Processing..." : "Add Agent"}
          </button>
        </form>
      </div>

      {/* Agents Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Loading agents...
                  </td>
                </tr>
              ) : agents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No agents found
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{agent.name}</td>
                    <td className="px-4 py-3 break-words max-w-xs">
                      {agent.email}
                    </td>
                    <td className="px-4 py-3">
                      {agent.countryCode} {agent.mobileNumber}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(agent._id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-800 disabled:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentManagement;
