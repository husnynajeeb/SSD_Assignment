import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";
import Notifications from "./Header/notifications";
import Toast from "./Toast/Toast";

const Header = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // use AuthContext for logout

  const [clickNotification, setClickNotification] = useState(false);
  const [notify, setNotify] = useState([]);
  const [newNotifyCount, setNewNotifyCount] = useState(0);

  // Toggle notification dropdown
  const toggleNotification = () => {
    setClickNotification(!clickNotification);
    if (newNotifyCount > 0) {
      axios
        .put(
          "http://localhost:5000/notify/mark-as-seen",
          {},
          { withCredentials: true }
        )
        .then(() => setNewNotifyCount(0))
        .catch(console.error);
    }
  };

  // Logout handler
  const handleLogout = () => {
    axios
      .get("http://localhost:5000/login/logout", { withCredentials: true })
      .then(() => {
        logout(); // clear frontend auth state
        Toast("Logged out successfully", "success");
        navigate("/"); // redirect to login
      })
      .catch((err) => {
        console.error(err);
        Toast("Logout failed. Try again.", "error");
      });
  };

  // Fetch notifications on mount
  useEffect(() => {
    axios
      .get("http://localhost:5000/notify/", { withCredentials: true })
      .then((res) => {
        setNotify(res.data);
        setNewNotifyCount(
          res.data.filter((n) => n.seen === "Pending").length
        );
      })
      .catch(console.error);
  }, []);

  return (
    <nav
      className="fixed ml-64 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      style={{ width: "84%" }}
    >
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleNotification}
            className="relative p-2 rounded-lg hover:bg-gray-100"
          >
            Notifications
            {newNotifyCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white px-1 rounded-full">
                {newNotifyCount > 9 ? "9+" : newNotifyCount}
              </span>
            )}
          </button>
          {clickNotification && <Notifications notify={notify} />}
        </div>

        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
