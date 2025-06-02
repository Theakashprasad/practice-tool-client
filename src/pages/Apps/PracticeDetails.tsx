import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../constants";
import { fetchStaffUsers, StaffUser } from "../../services/staffService";
import IconArrowLeft from "../../components/Icon/IconArrowLeft";
import {
  FaUser,
  FaMoneyBill,
  FaUsers,
  FaCalendarAlt,
  FaUserTie,
  FaUserCog,
  FaUserEdit,
  FaGlobeAmericas,
  FaIndustry,
  FaInfoCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { userService } from "../../services/userService";

const labelClass = "text-gray-500 font-semibold flex items-center gap-2";
const valueClass =
  "mt-1 text-lg text-gray-900 dark:text-white-dark break-words";
const sectionClass =
  "rounded-lg bg-white dark:bg-[#181f2c] shadow p-6 mb-6 border border-gray-100 dark:border-gray-800";
const dividerClass =
  "col-span-full border-b border-dashed border-gray-200 my-2";

const currencies = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "INR", name: "Indian Rupee" },
];

interface Invitation {
  id: string;
  email: string;
  level?: "admin" | "staff" | "client" | "";
  status: "pending" | "accepted" | "cancelled";
  created_at: string;
  updated_at: string;
}

const PracticeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [practice, setPractice] = useState<any>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPracticeDetails();
    fetchStaffAndInvitations();
  }, [id]);

  const fetchStaffAndInvitations = async () => {
    try {
      // Fetch both users and invitations
      const [users, invitationsResponse] = await Promise.all([
        userService.getAllUsers(),
        axios.get(`${API_BASE_URL}/api/invitation`),
      ]);

      // Convert User[] to StaffUser[] by mapping id to string
      setStaffUsers(
        Array.isArray(users)
          ? users.map((user) => ({ ...user, id: String(user.id) }))
          : []
      );
      setInvitations(
        Array.isArray(invitationsResponse.data) ? invitationsResponse.data : []
      );
    } catch (error) {
      console.error("Error fetching staff users and invitations:", error);
      setStaffUsers([]);
      setInvitations([]);
    }
  };

  // console.log("staffUsers", staffUsers);

  const fetchPracticeDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/practices/${id}?withStaff=true`
      );
      const data = await response.json();
      setPractice(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching practice details:", error);
      setIsLoading(false);
    }
  };

  const getStaffName = (staffId: string) => {
    // First check in staff users
    const staff = staffUsers.find((user) => user.id === staffId);
    if (staff) {
      return `${staff.first_name} ${staff.last_name}`;
    }

    // Then check in invitations
    const invitation = invitations.find((inv) => inv.id === staffId);
    if (invitation) {
      return `${invitation.email} (Pending)`;
    }

    return staffId;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPractice((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleStaffAccountantChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setPractice((prev: any) => ({
      ...prev,
      staffAccountantIds: selectedOptions,
    }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/practices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(practice),
      });
      if (response.ok) {
        Swal.fire({ icon: "success", title: "Practice updated!" });
        fetchPracticeDetails();
      } else {
        Swal.fire({ icon: "error", title: "Failed to update practice" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Failed to update practice" });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStaffSelect = (
    name: string,
    value: string | null,
    label: string
  ) => (
    <div>
      <span className={labelClass}>
        {FaUserTie({})} {label}
      </span>
      <select
        name={name}
        className="form-select mt-1 w-full"
        value={value || ""}
        onChange={handleChange}
      >
        <option value="">Select {label}</option>
        {/* Render active users */}
        {Array.isArray(staffUsers) &&
          staffUsers.map((staff) => (
            <option key={staff.id} value={staff.id}>
              {staff.first_name} {staff.last_name} ({staff.email})
            </option>
          ))}
        {/* Render pending invitations */}
        {Array.isArray(invitations) &&
          invitations
            .filter((inv) => inv.status === "pending")
            .map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.email} (Pending Invitation)
              </option>
            ))}
      </select>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="flex items-center justify-center h-screen">
        Practice not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          className="btn btn-outline-primary flex items-center gap-2"
          onClick={() => navigate("/apps/practice")}
        >
          <IconArrowLeft className="w-5 h-5" />
          <span>Back to List</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Practice Details
        </h2>
      </div>

      <form className={sectionClass} onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* General Info */}
          <div>
            <span className={labelClass}>
              {FaUser({ color: "var(--primary)" }) as JSX.Element} Name
            </span>
            <input
              name="name"
              className="form-input mt-1 w-full"
              value={practice.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <span className={labelClass}>
              {FaMoneyBill({ color: "#16a34a" }) as JSX.Element}
              Currency
            </span>
            <select
              name="currency"
              className="form-select mt-1 w-full"
              value={practice.currency || ""}
              onChange={handleChange}
              required
            >
              <option value="">Select Currency</option>
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className={dividerClass}></div>

          {/* Team Info */}
          {renderStaffSelect(
            "staffPartnerId",
            practice.staffPartnerId,
            "Staff Partner"
          )}
          {renderStaffSelect(
            "staffManager1Id",
            practice.staffManager1Id,
            "Staff Manager 1"
          )}
          {renderStaffSelect(
            "staffManager2Id",
            practice.staffManager2Id,
            "Staff Manager 2"
          )}
          {renderStaffSelect(
            "staffBookkeeper1Id",
            practice.staffBookkeeper1Id,
            "Staff Bookkeeper 1"
          )}
          {renderStaffSelect(
            "staffBookkeeper2Id",
            practice.staffBookkeeper2Id,
            "Staff Bookkeeper 2"
          )}
          {renderStaffSelect(
            "staffTaxSpecialistId",
            practice.staffTaxSpecialistId,
            "Staff Tax Specialist"
          )}
          {renderStaffSelect(
            "staffOther1Id",
            practice.staffOther1Id,
            "Staff Other 1"
          )}
          {renderStaffSelect(
            "staffOther2Id",
            practice.staffOther2Id,
            "Staff Other 2"
          )}
          {renderStaffSelect(
            "staffOther3Id",
            practice.staffOther3Id,
            "Staff Other 3"
          )}
          {renderStaffSelect(
            "staffOther4Id",
            practice.staffOther4Id,
            "Staff Other 4"
          )}
          {renderStaffSelect(
            "staffOther5Id",
            practice.staffOther5Id,
            "Staff Other 5"
          )}
          {renderStaffSelect(
            "staffAdmin1Id",
            practice.staffAdmin1Id,
            "Staff Admin 1"
          )}
          {renderStaffSelect(
            "staffAdmin2Id",
            practice.staffAdmin2Id,
            "Staff Admin 2"
          )}

          <div>
            <span className={labelClass}>
              {FaUserEdit({})} Staff Accountants
            </span>
            <select
              name="staffAccountantIds"
              className="form-select mt-1 w-full"
              value={practice.staffAccountantIds || []}
              onChange={handleStaffAccountantChange}
              multiple
            >
              <option value="">Select Staff Accountants</option>
              {/* Render active users */}
              {Array.isArray(staffUsers) &&
                staffUsers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name} ({staff.email})
                  </option>
                ))}
              {/* Render pending invitations */}
              {Array.isArray(invitations) &&
                invitations
                  .filter((inv) => inv.status === "pending")
                  .map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.email} (Pending Invitation)
                    </option>
                  ))}
            </select>
          </div>

          <div className={dividerClass}></div>

          {/* Meta Info */}
          <div>
            <span className={labelClass}>
              {" "}
              {FaCalendarAlt({ color: "3b82f6" }) as JSX.Element}
              Created At
            </span>
            <div className={valueClass}>
              {new Date(practice.createdAt).toLocaleString()}
            </div>
          </div>
          <div>
            <span className={labelClass}>
              {" "}
              {FaCalendarAlt({ color: "3b82f6" }) as JSX.Element}
              Updated At
            </span>
            <div className={valueClass}>
              {new Date(practice.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </form>

      {/* Associated Client Groups Section */}
      <div className={sectionClass + " p-0"}>
        <div className="flex items-center gap-2 px-6 pt-6 pb-2 border-b border-gray-100 dark:border-gray-800">
          {FaUsers({ color: "var(--primary)" }) as JSX.Element}
          <h3 className="text-xl font-semibold text-primary">
            Associated Client Groups
          </h3>
        </div>
        {Array.isArray(practice.clientGroups) &&
        practice.clientGroups.length > 0 ? (
          <div className="overflow-x-auto p-6">
            <table className="min-w-full bg-white dark:bg-[#181f2c] rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-[#232b3b]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase">
                    Practice Name
                  </th>
                </tr>
              </thead>
              <tbody>
                {practice.clientGroups.map((group: any) => (
                  <tr key={group.id} className="transition hover:bg-primary/10">
                    <td
                      className="px-4 py-3 font-medium text-primary cursor-pointer flex items-center gap-2 hover:underline"
                      onClick={() => navigate(`/apps/client-group/${group.id}`)}
                    >
                      <span>{group.name}</span>
                      <svg
                        className="w-4 h-4 text-primary group-hover:text-primary-dark"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {practice.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 p-6">
            No client groups associated with this practice.
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeDetails;
