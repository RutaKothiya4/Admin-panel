import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutThunk } from "../features/auth/authThunks";
import ProfilePhotoModal from "./ProfilePhotoModal";

export default function NavbarTop() {
  const { accessToken, role, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  console.log("navbar", user);

  const [logoutModal, setLogoutModal] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const toggleLogoutModal = () => setLogoutModal(!logoutModal);
  const toggleProfileModal = () => setProfileModalOpen(!profileModalOpen);

  const confirmLogout = async () => {
    toggleLogoutModal();
    await dispatch(logoutThunk());
    navigate("/login");
  };

  // Show minimal navbar on /login or /register
  if (["/login", "/register"].includes(location.pathname)) {
    return (
      <Navbar color="light" expand="md" className="mb-4 px-3 shadow-sm">
        <NavbarBrand tag={Link} to="/">
          RBAC
        </NavbarBrand>
        <Nav className="ms-auto" navbar>
          {location.pathname === "/register" && (
            <NavItem>
              <NavLink tag={Link} to="/login">
                Login
              </NavLink>
            </NavItem>
          )}
          {location.pathname === "/login" && (
            <NavItem>
              <NavLink tag={Link} to="/register">
                Register
              </NavLink>
            </NavItem>
          )}
        </Nav>
      </Navbar>
    );
  }

  // Full navbar for logged in or other pages
  return (
    <>
      <Navbar color="light" expand="md" className="mb-4 px-3 shadow-sm">
        <NavbarBrand tag={Link} to="/">
          RBAC
        </NavbarBrand>

        <Nav className="ms-auto" navbar>
          {accessToken ? (
            <>
              {user && (
                <div className="position-absolute top-50 start-50 translate-middle d-flex align-items-center gap-2">
                  <span className="fw-semibold">{user.username}</span>
                  <img
                    src={user.profilePhoto || "/default.png"}
                    alt="Profile"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      cursor: "pointer",
                    }}
                    onClick={toggleProfileModal}
                  />
                </div>
              )}

              <NavItem>
                <NavLink tag={Link} to="/home">
                  Home
                </NavLink>
              </NavItem>
              {role === "Super Admin" && (
                <>
                  <NavItem>
                    <NavLink tag={Link} to="/dashboard">
                      Dashboard
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/admin">
                      Admin
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/manager">
                      Manager
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/user">
                      User
                    </NavLink>
                  </NavItem>
                </>
              )}

              {role === "Manager" && (
                <>
                  <NavItem>
                    <NavLink tag={Link} to="/manager">
                      Manager
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink tag={Link} to="/user">
                      User
                    </NavLink>
                  </NavItem>
                </>
              )}

              <NavItem>
                <NavLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleLogoutModal();
                  }}
                >
                  Logout
                </NavLink>
              </NavItem>
            </>
          ) : (
            <>
              <NavItem>
                <NavLink tag={Link} to="/login">
                  Login
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/register">
                  Register
                </NavLink>
              </NavItem>
            </>
          )}
        </Nav>
      </Navbar>

      {/* Logout Modal */}
      <Modal isOpen={logoutModal} toggle={toggleLogoutModal}>
        <ModalHeader toggle={toggleLogoutModal}>Confirm Logout</ModalHeader>
        <ModalBody>Are you sure you want to logout?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={confirmLogout}>
            Yes, Logout
          </Button>
          <Button color="secondary" onClick={toggleLogoutModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={profileModalOpen}
        toggle={toggleProfileModal}
      />
    </>
  );
}
