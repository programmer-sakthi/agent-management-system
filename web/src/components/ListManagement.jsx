import { useEffect, useState } from "react";
import UpdateListModal from "./UpdateListModal";

const ListManagement = () => {
  const [lists, setLists] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/lists`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setLists(data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid CSV or Excel file");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/lists/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(
        `Successfully uploaded and distributed ${data.totalLists} lists`
      );
      setSelectedFile(null);
      fetchLists();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/lists/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete list");
      }
      fetchLists();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (list) => {
    setSelectedList(list);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedList(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">List Management</h2>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4">
          {success}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upload List</h3>
        <form
          onSubmit={handleUpload}
          className="space-y-4 md:flex md:items-center md:space-y-0 md:space-x-4"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (CSV or Excel)
            </label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className={`w-full md:w-auto py-2 px-4 rounded-md text-white ${
              loading || !selectedFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
          >
            {loading ? "Uploading..." : "Upload List"}
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Options
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lists.map((list) => (
              <tr key={list._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {list.firstName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{list.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{list.notes}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {list.assignedTo?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${
                      list.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : list.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {list.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => handleEdit(list)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => handleDelete(list._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UpdateListModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        list={selectedList}
        onUpdate={fetchLists}
      />
    </div>
  );
};

export default ListManagement;
